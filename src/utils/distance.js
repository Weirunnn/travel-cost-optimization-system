export async function fetchPerDiemLocal(zip, month) {
  try {
    const response = await fetch('/zip_meals_lookup_all_months.csv');
    if (!response.ok) {
      throw new Error("Failed to load CSV file");
    }

    const text = await response.text();
    const rows = text.trim().split('\n');
    const headers = rows[0].split(',').map(h => h.trim());

    const zipIndex = headers.indexOf("zip");
    const monthIndex = headers.indexOf("month");
    const mealsIndex = headers.indexOf("meals");
    const lodgingIndex = headers.indexOf("lodging");

    if (zipIndex === -1 || monthIndex === -1 || mealsIndex === -1 || lodgingIndex === -1) {
      throw new Error("❌ Required columns missing in CSV");
    }

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(',').map(c => c.trim());

      if (cols[zipIndex] === zip && cols[monthIndex] === month) {
        const meals = parseFloat(cols[mealsIndex]);
        const lodging = parseFloat(cols[lodgingIndex]);

        if (isNaN(meals) || isNaN(lodging)) {
          throw new Error(`❌ Invalid number format in row ${i + 1}`);
        }

        return { meals, lodging };
      }
    }

    throw new Error(`No data found for ZIP ${zip} in ${month}`);
  } catch (err) {
    console.error("fetchPerDiemLocal error:", err.message);
    throw err;
  }
}
