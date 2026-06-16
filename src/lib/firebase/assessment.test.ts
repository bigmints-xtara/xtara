// ============================================================================
// Assessment Service Tests
// Tests: getQuestionnaire, saveAssessment, waitForCareerPath,
//        getCareerPath, generateRecommendations
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- Mock Firebase modules ---
vi.mock("./firebase", () => ({
  db: {},
  auth: { currentUser: null },
  storage: {},
  functions: {},
  app: {},
}));

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockServerTimestamp = vi.fn(() => new Date("2025-01-01"));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({ _ref: true })),
  collection: vi.fn(() => ({ _ref: true })),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  getDocs: mockGetDocs,
  serverTimestamp: mockServerTimestamp,
  Timestamp: class {
    toDate() {
      return new Date();
    }
  },
}));

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() =>
    vi.fn(() => Promise.resolve({ data: { id: "mock-fn-response" } })),
  ),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => ({})),
}));

const { getQuestionnaire, saveAssessment, waitForCareerPath, getCareerPath, generateRecommendations } = require("./assessment");

describe("Assessment Service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getQuestionnaire", () => {
    it("returns parsed steps when snapshot exists with data.value string", async () => {
      const mockSnapshot = {
        exists: vi.fn(() => true),
        data: vi.fn(() => ({
          value: JSON.stringify({ steps: [{ id: "q1", label: "Name", fieldType: "text" }] }),
        })),
      };
      mockGetDoc.mockResolvedValueOnce(mockSnapshot);

      const result = await getQuestionnaire();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: "q1", label: "Name", fieldType: "text" });
    });

    it("returns steps when snapshot has data.steps array", async () => {
      const mockSnapshot = {
        exists: vi.fn(() => true),
        data: vi.fn(() => ({
          steps: [{ id: "q2", label: "Age", type: "number" }],
        })),
      };
      mockGetDoc.mockResolvedValueOnce(mockSnapshot);

      const result = await getQuestionnaire();
      expect(result).toHaveLength(1);
      expect(result[0].fieldType).toBe("number");
    });

    it("returns empty array when snapshot does not exist", async () => {
      const mockSnapshot = {
        exists: vi.fn(() => false),
        data: vi.fn(() => ({})),
      };
      mockGetDoc.mockResolvedValueOnce(mockSnapshot);

      const result = await getQuestionnaire();
      expect(result).toEqual([]);
    });

    it("returns empty array on error", async () => {
      mockGetDoc.mockRejectedValueOnce(new Error("Network error"));

      const result = await getQuestionnaire();
      expect(result).toEqual([]);
    });

    it("returns empty array when JSON parse fails", async () => {
      const mockSnapshot = {
        exists: vi.fn(() => true),
        data: vi.fn(() => ({ value: "{invalid json}" })),
      };
      mockGetDoc.mockResolvedValueOnce(mockSnapshot);

      const result = await getQuestionnaire();
      expect(result).toEqual([]);
    });
  });

  describe("saveAssessment", () => {
    it("saves assessment data with merge and updates user profile", async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const result = await saveAssessment("user-1", { interests: ["coding"], skippedFields: ["age"], isRetake: true }, true);

      expect(result).toBe("user-1");
      expect(mockSetDoc).toHaveBeenCalledTimes(2);
    });

    it("throws error on failure", async () => {
      mockSetDoc.mockRejectedValueOnce(new Error("Firestore error"));

      await expect(saveAssessment("user-2", { interests: ["art"] }, false)).rejects.toThrow();
    });
  });

  describe("generateRecommendations", () => {
    it("formats data and calls Cloud Function", async () => {
      const result = await generateRecommendations("assess-1", {
        results: { fullName: "Alice", interests: ["math"], currentGrade: "grade10" },
      });

      expect(result).toEqual({ id: "mock-fn-response" });
    });
  });

  describe("getCareerPath", () => {
    it("returns career path data when doc exists", async () => {
      const mockSnapshot = {
        exists: vi.fn(() => true),
        data: vi.fn(() => ({ title: "Software Engineer" })),
      };
      mockGetDoc.mockResolvedValueOnce(mockSnapshot);

      const result = await getCareerPath("cp-1");
      expect(result).toEqual({ id: "cp-1", title: "Software Engineer" });
    });

    it("returns null when doc does not exist", async () => {
      const mockSnapshot = {
        exists: vi.fn(() => false),
        data: vi.fn(() => ({})),
      };
      mockGetDoc.mockResolvedValueOnce(mockSnapshot);

      const result = await getCareerPath("cp-1");
      expect(result).toBeNull();
    });
  });

  describe("waitForCareerPath", () => {
    it("returns career path ID when found within max attempts", async () => {
      // First call returns empty, second returns match
      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: "cp-1" }],
      });
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const result = await waitForCareerPath("assess-1", 30);
      expect(result).toBe("cp-1");
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it("returns null when max attempts exceeded", async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = waitForCareerPath("assess-1", 3);
      // Advance timers for 3 attempts × 2 seconds = 6 seconds
      await vi.advanceTimersByTimeAsync(7000);
      const resolved = await result;
      expect(resolved).toBeNull();
    });
  });
});
