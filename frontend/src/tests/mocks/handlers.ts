import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };
    
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        membershipId: 'TEST123',
        borrowedBooks: 2,
        borrowingLimit: 5,
        token: 'fake-token-123',
      }, { status: 200 });
    }
    
    return HttpResponse.json(
      { message: 'Invalid email or password' }, 
      { status: 401 }
    );
  }),
  
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();
    const { email } = body as { email: string };
    
    if (email === 'exists@example.com') {
      return HttpResponse.json(
        { message: 'User already exists' }, 
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      _id: 'newuser123',
      name: 'New User',
      email,
      role: 'user',
      membershipId: 'NEW123',
      token: 'new-fake-token-123',
    }, { status: 201 });
  }),
  
  // Books handlers
  http.get(`${API_URL}/books`, () => {
    return HttpResponse.json({
      items: [
        {
          _id: 'book1',
          id: 'book1',
          title: 'Test Book 1',
          author: 'Author 1',
          genre: ['Fiction', 'Mystery'],
          isbn: '123456789',
          description: 'A test book description',
          publishedDate: '2023-01-01T00:00:00.000Z',
          totalCopies: 5,
          availableCopies: 3,
          coverImage: 'https://example.com/book1.jpg',
        },
        {
          _id: 'book2',
          id: 'book2',
          title: 'Test Book 2',
          author: 'Author 2',
          genre: ['Non-Fiction', 'Biography'],
          isbn: '987654321',
          description: 'Another test book description',
          publishedDate: '2022-06-15T00:00:00.000Z',
          totalCopies: 3,
          availableCopies: 0,
          coverImage: 'https://example.com/book2.jpg',
        },
      ],
      page: 1,
      limit: 10,
      totalItems: 2,
      totalPages: 1,
    }, { status: 200 });
  }),
  
  http.get(`${API_URL}/books/:id`, ({ params }) => {
    const id = params.id;
    
    if (id === 'book1') {
      return HttpResponse.json({
        _id: 'book1',
        id: 'book1',
        title: 'Test Book 1',
        author: 'Author 1',
        genre: ['Fiction', 'Mystery'],
        isbn: '123456789',
        description: 'A test book description',
        publishedDate: '2023-01-01T00:00:00.000Z',
        totalCopies: 5,
        availableCopies: 3,
        coverImage: 'https://example.com/book1.jpg',
      }, { status: 200 });
    }
    
    return HttpResponse.json(
      { message: 'Book not found' }, 
      { status: 404 }
    );
  }),
  
  // Borrowing handlers
  http.post(`${API_URL}/borrowings`, () => {
    return HttpResponse.json({
      message: 'Book borrowed successfully',
      borrowing: {
        _id: 'borrow1',
        userId: 'user123',
        bookId: 'book1',
        borrowDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'borrowed',
      },
    }, { status: 201 });
  }),
];
