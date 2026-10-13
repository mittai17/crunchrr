import { describe, expect, it } from "vitest";
import { GET } from "../apps/web/src/app/api/holidays/route";

describe("regional public holidays", () => {
  it("returns a holiday for the selected Indian state", async () => {
    const response = await GET(new Request("http://localhost/api/holidays?country=IN&state=TN&year=2026"));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.states.TN).toBeTruthy();
    expect(data.holidays).toContainEqual({ date: "2026-01-26", name: "Republic Day" });
  });

  it("rejects an unsupported subdivision", async () => {
    const response = await GET(new Request("http://localhost/api/holidays?country=IN&state=ZZ&year=2026"));
    expect(response.status).toBe(400);
  });
});
