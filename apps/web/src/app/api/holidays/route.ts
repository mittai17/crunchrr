import Holidays from "date-holidays";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = (params.get("country") || "IN").toUpperCase();
  const state = (params.get("state") || "").toUpperCase();
  const year = Number(params.get("year"));
  if (!/^[A-Z]{2}$/.test(country) || !Number.isInteger(year) || year < 2020 || year > 2035) {
    return Response.json({ error: "Choose a valid country and year." }, { status: 400 });
  }
  const holidays = new Holidays();
  const countries = holidays.getCountries();
  if (!countries[country]) {
    return Response.json({ error: "Holiday coverage is unavailable for this country." }, { status: 400 });
  }
  const states = holidays.getStates(country) || {};
  if (state && !states[state]) {
    return Response.json({ error: "Choose a supported state or province." }, { status: 400 });
  }
  holidays.init(country, state || undefined);
  return Response.json(
    {
      country,
      state,
      countries,
      states,
      holidays: holidays.getHolidays(year)
        .filter((holiday) => holiday.type === "public")
        .map((holiday) => ({
          date: holiday.date.slice(0, 10),
          name: holiday.name,
        })),
    },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
