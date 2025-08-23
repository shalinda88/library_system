import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import userService from "../services/userService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { UserRole } from "../types";

interface UserFormData {
  name: string;
  email: string;
  role: string; // Using string instead of UserRoleType for form handling
  password: string;
  confirmPassword: string;
  membershipId: string;
  borrowingLimit: number;
  isActive: boolean;
}

const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: UserRole.USER,
    password: "",
    confirmPassword: "",
    membershipId: generateMembershipId(),
    borrowingLimit: 5,
    isActive: true,
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<UserFormData & { general: string }>
  >({});

  // Generate a random membership ID
  function generateMembershipId() {
    const prefix = "LIB";
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `${prefix}-${currentYear}-${randomNum}`;
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const userData = await userService.getUserById(id);

        // Only set the fields we want to edit
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || UserRole.USER,
          password: "",
          confirmPassword: "",
          membershipId: userData.membershipId || "",
          borrowingLimit: userData.borrowingLimit || 5,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrors({
          general: "Failed to load user data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData & { general: string }> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.role) newErrors.role = "Role is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation for new users
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (formData.password && formData.password.length > 0) {
      // Password validation for existing users (only if provided)
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // Borrowing limit validation
    if (!formData.borrowingLimit || formData.borrowingLimit < 1) {
      newErrors.borrowingLimit = 1; // Assign a numeric value instead of a string
    }

    // Membership ID validation
    if (!formData.membershipId.trim()) {
      newErrors.membershipId = "Membership ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (isEditMode) {
        // Only include password if it was changed
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role.toLowerCase(), // Ensure role is lowercase to match backend enum
          membershipId: formData.membershipId,
          borrowingLimit: formData.borrowingLimit,
          isActive: formData.isActive,
          password: formData.password || undefined,
          // confirmPassword is not needed for API
        };

        await userService.updateUser(id, updateData);
      } else {
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role.toLowerCase(), // Ensure role is lowercase to match backend enum
          membershipId: formData.membershipId,
          borrowingLimit: formData.borrowingLimit,
          isActive: formData.isActive,
        };

        await userService.createUser(createData);
      }

      navigate("/manage/users");
    } catch (error: any) {
      console.error("Error saving user:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors.reduce(
          (acc: any, err: any) => ({
            ...acc,
            [err.param]: err.msg,
          }),
          {}
        );
        setErrors(backendErrors);
      } else if (error.response?.data?.error) {
        // Handle specific error from the backend
        console.log("Backend error:", error.response.data);

        // Special handling for role validation error
        if (error.response.data.error.includes("validation failed: role")) {
          setErrors({
            role: "Invalid role value. Please select a valid role.",
            general:
              "There was a problem with the role field. Please make sure to select a valid role.",
          });
        } else {
          setErrors({
            general:
              error.response.data.message + ": " + error.response.data.error,
          });
        }
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            "An error occurred while saving the user. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {isEditMode ? "Edit User" : "Create New User"}
        </h1>

        {errors.general && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {isEditMode
                  ? "Password (leave blank to keep current)"
                  : "Password*"}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.password
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {isEditMode
                  ? "Confirm Password (if changing)"
                  : "Confirm Password*"}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.confirmPassword
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Role*
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.role
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value={UserRole.USER}>User</option>
                <option value={UserRole.LIBRARIAN}>Librarian</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Membership ID */}
            <div>
              <label
                htmlFor="membershipId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Membership ID*
              </label>
              <input
                type="text"
                id="membershipId"
                name="membershipId"
                value={formData.membershipId}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.membershipId
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.membershipId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.membershipId}
                </p>
              )}
            </div>

            {/* Borrowing Limit */}
            <div>
              <label
                htmlFor="borrowingLimit"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Borrowing Limit*
              </label>
              <input
                type="number"
                id="borrowingLimit"
                name="borrowingLimit"
                min="1"
                max="50"
                value={formData.borrowingLimit}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.borrowingLimit
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.borrowingLimit && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.borrowingLimit}
                </p>
              )}
            </div>


            {/* Active Status */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Active User
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/manage/users")}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isEditMode ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserFormPage;
