import { describe, expect, it } from "vitest";
import { education, experience, interests, links, projects, skills } from "./data";

describe("Verified portfolio facts", () => {
  it("records the supplied education and graduation", () => {
    expect(education).toEqual({ university: "Brown University", degree: "Sc.B. in Electrical Engineering", graduation: "May 2030" });
  });
  it("records O2NYC's verified position and date range", () => {
    expect(experience.find((entry) => entry.org === "O2NYC")).toMatchObject({ role: "Head of Technology", period: "January 2025 – Present" });
  });
  it("records the corrected Formula Racing position and start", () => {
    expect(experience.find((entry) => entry.org === "Brown Formula Racing")).toMatchObject({ role: "Pedal Box Team Member", period: "October 2026 – Present" });
  });
  it("records the full OIT organization and documented range", () => {
    expect(experience.find((entry) => entry.org === "Brown University Office of Information Technology")).toMatchObject({ role: "Student Technician", period: "October 2026 – Present" });
  });
  it("records the StuyPulse position and documented range", () => {
    expect(experience.find((entry) => entry.org === "Stuyvesant FIRST Robotics Team 694 StuyPulse")).toMatchObject({ role: "Software Engineer & FLL Mentor", period: "September 2023 – June 2026" });
  });
  it("records the Student Union position and documented range", () => {
    expect(experience.find((entry) => entry.org === "Stuyvesant Student Union")).toMatchObject({ role: "Caucus IT Web Developer", period: "August 2024 – June 2026" });
  });
  it("uses the documented tutoring end date until an update is confirmed", () => {
    expect(experience.find((entry) => entry.org === "Mypy Coding")).toMatchObject({ role: "Senior Volunteer Tutor", period: "July 2024 – June 2025" });
  });
  it("excludes research interests from professional experience", () => {
    expect(experience.map((entry) => entry.org)).not.toContain("Research & Interests");
    expect(experience).toHaveLength(6);
  });
  it("uses the supplied GitHub profile", () => {
    expect(links.github).toBe("https://github.com/ardianagoes");
  });
  it("uses the supplied LinkedIn profile", () => {
    expect(links.linkedin).toBe("https://www.linkedin.com/in/ardianagoes/");
  });
  it("keeps the unprovided resume unavailable", () => {
    expect(links.resume).toBeUndefined();
  });
  it("limits hardware skills to the verified list", () => {
    expect(skills.find((group) => group.group === "Hardware")?.items).toEqual(["ESP32", "Arduino", "NodeMCU", "Sensor integration", "Soldering", "PC building"]);
  });
  it("limits programming skills to the verified list", () => {
    expect(skills.find((group) => group.group === "Programming")?.items).toEqual(["Java", "Python", "JavaScript"]);
  });
  it("limits software and tools to the verified list", () => {
    expect(skills.find((group) => group.group === "Software and Tools")?.items).toEqual(["Git", "SolidWorks", "WPILib", "PathPlanner", "React", "HTML/CSS"]);
    expect(skills).toHaveLength(3);
  });
  it("separates exploration subjects from demonstrated skills", () => {
    expect(interests).toEqual(["FPGA and digital design", "Computer architecture", "VLSI", "Semiconductors", "Low-latency hardware", "Robotics"]);
    expect(skills.flatMap((group) => group.items)).not.toContain("FPGA");
  });
  it("records the FlatSat project period", () => {
    expect(projects.find((project) => project.id === "04")?.period).toBe("December 2024 – February 2025");
  });
  it("adds Snoozeless without changing existing project IDs", () => {
    expect(projects.map((project) => [project.id, project.title])).toEqual([["01", "O2NYC"], ["02", "Furney"], ["03", "Deadline Desk"], ["04", "CubeSat FlatSat"], ["05", "FIRST Robotics"], ["06", "Snoozeless"]]);
    expect(projects.find((project) => project.id === "06")?.period).toBe("October 2026 – November 2026");
  });
});