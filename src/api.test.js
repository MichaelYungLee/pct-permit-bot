const api = require('./api');

let calendar = [
    { start_date: '2023-03-01', num: '35'},
    { start_date: '2023-04-01', num: '30'},
    { start_date: '2023-04-25', num: '32'},
    { start_date: '2023-05-01', num: '01'},
    { start_date: '2023-05-31', num: '35'},
];

let limit = 35;
let availableDates = api.getAvailableDates(calendar, limit);

test('should return three available dates', () => {
    expect(availableDates).toStrictEqual({
        '2023-04-01': 5, 
        '2023-04-25': 3, 
        '2023-05-01': 34
    });
});

test('should return no available dates', () => {
    expect(api.getAvailableDates([], limit)).toStrictEqual({});
});

test('should return true to indicate desired dates', () => {
    expect(api.containsDesiredDates(availableDates)).toEqual(true);
});

test('should return false to indicate no desired dates', () => {
    expect(api.containsDesiredDates({'2023-03-14': 1, '2023-05-16': 1})).toEqual(false);
});

// api.sendEmailWithAvailableDates(availableDates);