import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import CareerScore from "../components/CareerSuggestion/CareerScore";
import SkillMatchList from "../components/CareerSuggestion/SkillMatchList";
import MarketInfo from "../components/CareerSuggestion/MarketInfo";
import CareerPathCard from "../components/CareerSuggestion/CareerPathCard";
import { CareerPathSuggestion } from "../lib/api";

describe("Career Suggestion Frontend Components", () => {
  const mockCareer: CareerPathSuggestion = {
    career_id: "backend-developer",
    career_title: "Backend Developer",
    category: "Software Engineering",
    description: "Design and implement scalable APIs and backend services.",
    match_score: 86.5,
    match_level: "Strong Fit",
    matching_skills: ["python", "fastapi", "postgresql", "docker"],
    matching_skills_display: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    missing_skills: ["kubernetes", "redis"],
    missing_skills_display: ["Kubernetes", "Redis"],
    transition_difficulty: "Low",
    why_fit: "Your strong background in Python and FastAPI fits modern backend requirements.",
    growth_trajectory: "Clear pathway to Senior Backend Engineer and Cloud Solutions Architect.",
    recommended_steps: ["Learn Redis for caching", "Practice Kubernetes deployments"],
    missing_skills_summary: "Acquiring Redis and Kubernetes will elevate your system design readiness.",
    market_info: {
      career_id: "backend-developer",
      experience_level: "mid",
      salary_min: 900000,
      salary_max: 1800000,
      currency: "INR",
      market_demand: "High",
      source: "market_dataset",
      updated_at: "2026-08-01",
      salary_display: "₹9.0L – ₹18.0L",
    },
    confidence: 0.92,
  };

  test("CareerScore renders percentage and match level", () => {
    render(<CareerScore score={86.5} matchLevel="Strong Fit" />);
    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByText("Strong Fit")).toBeInTheDocument();
  });

  test("SkillMatchList displays matching and missing skills", () => {
    render(
      <SkillMatchList
        matchingSkills={mockCareer.matching_skills_display}
        missingSkills={mockCareer.missing_skills_display}
      />
    );
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });

  test("MarketInfo renders salary range, demand, and transition effort", () => {
    render(
      <MarketInfo
        marketInfo={mockCareer.market_info}
        transitionDifficulty={mockCareer.transition_difficulty}
      />
    );
    expect(screen.getByText("₹9.0L – ₹18.0L")).toBeInTheDocument();
    expect(screen.getByText(/High Demand/i)).toBeInTheDocument();
    expect(screen.getByText(/Low Effort/i)).toBeInTheDocument();
  });

  test("CareerPathCard renders and expands details", () => {
    render(<CareerPathCard career={mockCareer} rank={1} />);
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Software Engineering")).toBeInTheDocument();

    const expandBtn = screen.getByText("Why You Fit");
    fireEvent.click(expandBtn);

    expect(screen.getByText("Why You Fit This Role")).toBeInTheDocument();
    expect(screen.getByText(/Your strong background in Python/i)).toBeInTheDocument();
  });
});
