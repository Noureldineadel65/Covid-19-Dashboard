d3.csv("full_data.csv", function (row) {
	return {
		biweekly_cases: +row.biweekly_cases,
		biweekly_deaths: +row.biweekly_deaths,
		date: row.date,
		location: row.location,
		new_cases: +row.new_cases,
		total_cases: +row.total_cases,
		weekly_cases: +row.weekly_cases,
		weekly_deaths: +row.weekly_deaths,
	};
}).then(function (d) {
	const dataset = formatData(d);
	console.log(dataset);
});
function formatData(data) {
	const allCountriesDates = [...new Set(data.map((e) => e.date))];
	const minYear = allCountriesDates[0];
	const maxYear = allCountriesDates.splice(-1)[0];
	const object = {};
	allCountriesDates.forEach((date) => {
		const countriesObject = {};
		data.filter((e) => e.date === date).forEach((e) => {
			countriesObject[e.location] = e;
		});
		object[date] = countriesObject;
	});
	return {
		data: object,
		minYear,
		maxYear,
	};
}
// biweekly_cases: ""
// biweekly_deaths: ""
// date: "2019-12-31"
// location: "Afghanistan"
// new_cases: "0"
// new_deaths: "0"
// total_cases: "0"
// total_deaths: "0"
// weekly_cases: ""
// weekly_deaths: ""
