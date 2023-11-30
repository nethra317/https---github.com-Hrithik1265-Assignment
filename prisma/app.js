const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json());

// Middleware to check if the user is a regular user
const checkUserRole = async (req, res, next) => {
  const userId = req.params.id; // Assuming this is the logged-in user's ID or identifier
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { admin: true }, // Assuming there's a 'role' field in the user table
    });

    if (user && user.role === 'user') {
      // If the user role is 'user', proceed to the next middleware/route handler
      next();
    } else {
      // If the user role is not 'user', return an error response
      return res.status(403).json({ error: 'Only users are allowed to access this resource' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply the checkUserRole middleware to the routes that need to be restricted to users only
app.get('/users', checkUserRole, async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', checkUserRole, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(userId);
});

// Get a single user by ID
app.get('/users/:id', async (req, res) => {
  const adminId = parseInt(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Create a new user
app.post('/users', async (req, res) => {
  const { username, email } = req.body;

  const newUser = await prisma.user.create({
    data: { username, email },
  });

  res.json(newUser);
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, email } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { username, email },
  });

  res.json(updatedUser);
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  const deletedUser = await prisma.user.delete({
    where: { id: userId },
  });

  res.json(deletedUser);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
