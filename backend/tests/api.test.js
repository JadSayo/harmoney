const request = require("supertest");
const { app, server } = require("../src/index");
const axios = require("axios");
jest.mock("axios");

const mockPuppies = [
  {
    id: 1,
    name: "Buddy",
    age: 2,
    gender: "male",
    isVaccinated: true,
    isNeutered: true,
    size: "medium",
    breed: "Labrador Retriever",
    traits: ["Friendly", "Active"],
    photoUrl: "https://example.com/buddy.jpg",
  },
  {
    id: 2,
    name: "Daisy",
    age: 1,
    gender: "female",
    isVaccinated: true,
    isNeutered: false,
    size: "small",
    breed: "Shih Tzu",
    traits: ["Playful", "Cute"],
    photoUrl: "https://example.com/daisy.jpg",
  },
];

// Mock axios response
axios.get.mockResolvedValue({ data: mockPuppies });

describe("Puppy API", () => {
  it("should fetch a list of puppies", async () => {
    const response = await request(app).get("/api/puppies");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPuppies);
  });
});
