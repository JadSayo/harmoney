const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

// Get all puppies
router.get("/", [verifyToken], async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM puppies");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching puppies:", error);
    res.status(500).json({ message: "Error fetching puppies" });
  }
});

// Get a specific puppy by ID
router.get("/:id", [verifyToken], async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM puppies WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Puppy not found" });
    }
  } catch (error) {
    console.error("Error fetching puppy:", error);
    res.status(500).json({ message: "Error fetching puppy" });
  }
});

// Add a new puppy
router.post("/", [verifyToken], async (req, res) => {
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
      "INSERT INTO puppies (name, age, gender, isVaccinated, isNeutered, size, breed, traits, photoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      ],
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error adding puppy:", error);
    res.status(500).json({ message: "Error adding puppy" });
  }
});

// Update an existing puppy
router.put("/:id", verifyToken, async (req, res) => {
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
      "UPDATE puppies SET name = ?, age = ?, gender = ?, isVaccinated = ?, isNeutered = ?, size = ?, breed = ?, traits = ?, photoUrl = ? WHERE id = ?",
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
      ],
    );
    if (result.affectedRows > 0) {
      res.json({ id: req.params.id, ...req.body });
    } else {
      res.status(404).json({ message: "Puppy not found" });
    }
  } catch (error) {
    console.error("Error updating puppy:", error);
    res.status(500).json({ message: "Error updating puppy" });
  }
});

// Delete a puppy
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM puppies WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows > 0) {
      res.status(200).send({ message: "Puppy successfully deleted" });
    } else {
      res.status(404).json({ message: "Puppy not found" });
    }
  } catch (error) {
    console.error("Error deleting puppy:", error);
    res.status(500).json({ message: "Error deleting puppy" });
  }
});
