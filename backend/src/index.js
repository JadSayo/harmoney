const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const app = express();
const PORT = 3001;

app.use(cors());

app.use(cors());
app.use(express.json());

let db;

async function initializeDatabase(test) {
  if (!test)
    try {
      db = await mysql.createConnection(dbConfig);
      console.log('Connected to the database');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
}

async function closeDatabase() {
  if (db) {
    await db.end();
    console.log('Database connection closed');
  }
}

// Get all puppies
app.get('/api/puppies/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT p.* FROM puppies p LEFT JOIN adoption_details ad ON p.id = ad.puppy_id WHERE ad.puppy_id IS NULL'
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching puppies:', error);
    return res.status(500).json({ message: 'Error fetching puppies' });
  }
});

// Get a specific puppy by ID
app.get('/api/puppies/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM puppies WHERE id = ?', [
      req.params.id,
    ]);
    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ message: 'Puppy not found' });
    }
  } catch (error) {
    console.error('Error fetching puppy:', error);
    return res.status(500).json({ message: 'Error fetching puppy' });
  }
});

// Add a new puppy
app.post('/api/puppies/', async (req, res) => {
  const {
    name,
    age,
    gender,
    isVaccinated,
    isNeutered,
    size,
    breed,
    traits,
    photoUrl,
  } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO puppies (name, age, gender, isVaccinated, isNeutered, size, breed, traits, photoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        age,
        gender,
        isVaccinated,
        isNeutered,
        size,
        breed,
        traits.split(','),
        photoUrl,
      ]
    );
    return res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding puppy:', error);
    return res.status(500).json({ message: 'Error adding puppy' });
  }
});

// Update an existing puppy
app.put('/api/puppies/:id', async (req, res) => {
  const {
    name,
    age,
    gender,
    isVaccinated,
    isNeutered,
    size,
    breed,
    traits,
    photoUrl,
  } = req.body;
  try {
    const [result] = await db.execute(
      'UPDATE puppies SET name = ?, age = ?, gender = ?, isVaccinated = ?, isNeutered = ?, size = ?, breed = ?, traits = ?, photoUrl = ? WHERE id = ?',
      [
        name,
        age,
        gender,
        isVaccinated,
        isNeutered,
        size,
        breed,
        JSON.stringify(traits),
        photoUrl,
        req.params.id,
      ]
    );
    if (result.affectedRows > 0) {
      return res.json({ id: req.params.id, ...req.body });
    } else {
      return res.status(404).json({ message: 'Puppy not found' });
    }
  } catch (error) {
    console.error('Error updating puppy:', error);
    return res.status(500).json({ message: 'Error updating puppy' });
  }
});

// Delete a puppy
app.delete('/api/puppies/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM puppies WHERE id = ?', [
      req.params.id,
    ]);
    if (result.affectedRows > 0) {
      return res.status(200).send({ message: 'Puppy successfully deleted' });
    } else {
      return res.status(404).json({ message: 'Puppy not found' });
    }
  } catch (error) {
    console.error('Error deleting puppy:', error);
    return res.status(500).json({ message: 'Error deleting puppy' });
  }
});

// Adopt a puppy
app.post('/api/puppies/adopt', async (req, res) => {
  const { puppyId, userId } = req.body;
  try {
    const [existingPuppy] = await db.execute(
      'SELECT * FROM puppies WHERE id = ?',
      [puppyId]
    );

    if (!existingPuppy || existingPuppy.length === 0) {
      return res.status(404).json({ message: 'Puppy not found' });
    }

    const [isAdopted] = await db.execute(
      'SELECT * FROM adoption_details WHERE puppy_id = ?',
      [puppyId]
    );

    if (isAdopted.length > 0) {
      return res.status(200).json({ message: 'Puppy already adopted!' });
    }

    await db.execute(
      'INSERT INTO adoption_details (puppy_id, adopter_id) VALUES (?, ?)',
      [puppyId, userId]
    );

    return res.json({ message: 'Puppy adopted successfully' });
  } catch (error) {
    console.error('Error adopting puppy:', error);
    return res.status(500).json({ message: 'Error adopting puppy' });
  }
});

app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, role]
    );
    if (result.insertId) {
      return res.status(201).send({ message: 'User successfully created.' });
    }
    return res.status(500).json({ message: 'Error adding user' });
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ message: 'Error adding user' });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (rows.length > 0) {
      return res.json(rows[0]);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await isAdmin(email, password);
    return res.send(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(400).json(error);
  }
});

async function isAdmin(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const [existingUser] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!existingUser || existingUser.length === 0) {
        return reject({ status: 404, message: 'User not found' });
      }

      const user = existingUser[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return reject({ status: 401, message: 'Invalid password' });
      }

      resolve({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.firstname + ' ' + user.lastname,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      reject({ status: 500, message: 'Error logging in' });
    }
  });
}

const server = app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  initializeDatabase();
});

module.exports = { app, server, closeDatabase, initializeDatabase };
