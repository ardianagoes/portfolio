import { describe, expect, it } from "vitest";
import { experience, links, skills } from "./data";

describe("Verified portfolio facts", () => {
  it("records the supplied Formula Racing dates and subteam", () => {
    expect(experience.find((entry) => entry.org === "Brown Formula Racing")).toEqual({ org: "Brown Formula Racing", role: "Team Member", period: "Fall 2026–Present", note: "Working with the pedal box/throttle subteam." });
  });
  it("records the supplied OIT dates and role", () => {
    expect(experience.find((entry) => entry.org === "Brown OIT")).toEqual({ org: "Brown OIT", role: "IT Service Center Student Technician", period: "October 2026–Present", note: "Providing technical support." });
  });
  it("records the supplied tutoring dates and role", () => {
    expect(experience.find((entry) => entry.org === "Mypy Coding")).toEqual({ org: "Mypy Coding", role: "Senior Volunteer Tutor", period: "July 2024–Present", note: "Teaching programming to younger students." });
  });
  it("excludes research interests from professional experience", () => {
    expect(experience.map((entry) => entry.org)).not.toContain("Research & Interests");
    expect(experience).toHaveLength(3);
  });
  it("uses the supplied GitHub profile", () => {
    expect(links.github).toBe("https://github.com/ardianagoes");
  });
  it("keeps missing LinkedIn and resume destinations unavailable", () => {
    expect(links.linkedin).toBeUndefined();
    expect(links.resume).toBeUndefined();
  });
  it("flags every previously generated skills group for confirmation", () => {
    expect(skills).toHaveLength(4);
    expect(skills.map((group) => group.confirmation)).toEqual(["pending", "pending", "pending", "pending"]);
  });
});