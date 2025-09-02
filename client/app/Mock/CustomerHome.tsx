export interface Filter {
    name: string;
    count: number;
}

export const CustomerHome:Filter[] = 
     [
        { name: "Near Me", count: 15 },
        { name: "3 Star Hotel", count: 6 },
        { name: "5 Star Hotel", count: 3 },
        { name: "Waiting Period Less then 5 Min", count: 6 },
        { name: "Waiting Period More then 15 Min", count: 7 },
        { name: "Only Veg Restaurant", count: 1 },
        { name: "Only Non Veg Restaurant", count: 8 },
        { name: "Only Bar & Restaurant", count: 6 },
        { name: "5 Star Rating", count: 2 },
        { name: "Only Buffet", count: 1 },
        { name: "Only Self Service", count: 5 },
        { name: "Only Table Service", count: 9 },
    ];
