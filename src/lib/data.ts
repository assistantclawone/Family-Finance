import type { User, Transaction, Asset, ForecastDataPoint, Appointment, HealthInsurance, EmergencyContact, Region } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userAvatar =
  PlaceHolderImages.find((img) => img.id === 'user-avatar')?.imageUrl ||
  'https://picsum.photos/seed/user/100/100';

export const user: User = {
  name: 'Familie Schmidt',
  email: 'schmidt-familie@example.com',
  avatar: userAvatar,
};

const assetsData: { [key in Region]: Asset[] } = {
    DE: [
        { id: '1', name: 'Girokonto', type: 'Bank Account', balance: 12500, currency: 'EUR' },
        { id: '2', name: 'Sparkonto', type: 'Bank Account', balance: 35000, currency: 'EUR' },
        { id: '3', name: 'Aktienportfolio', type: 'Portfolio', balance: 78000, currency: 'EUR' },
    ],
    AT: [
        { id: '1', name: 'Gehaltskonto', type: 'Bank Account', balance: 11500, currency: 'EUR' },
        { id: '2', name: 'Sparbuch', type: 'Bank Account', balance: 32000, currency: 'EUR' },
        { id: '3', name: 'Wertpapierdepot', type: 'Portfolio', balance: 75000, currency: 'EUR' },
    ],
    CH: [
        { id: '1', name: 'Privatkonto', type: 'Bank Account', balance: 14000, currency: 'CHF' },
        { id: '2', name: 'Sparkonto 3a', type: 'Bank Account', balance: 40000, currency: 'CHF' },
        { id: '3', name: 'Anlageportfolio', type: 'Portfolio', balance: 85000, currency: 'CHF' },
    ]
};

const recurringExpensesData: { [key in Region]: Transaction[] } = {
    DE: [
        { id: 't1', description: 'Miete', amount: 1500, currency: 'EUR', date: '2024-08-01', type: 'expense', isRecurring: true, isEstimate: false, status: 'pending' },
        { id: 't2', description: 'Strom & Gas', amount: 200, currency: 'EUR', date: '2024-08-15', type: 'expense', isRecurring: true, isEstimate: true, status: 'pending' },
        { id: 't3', description: 'Internet', amount: 50, currency: 'EUR', date: '2024-08-10', type: 'expense', isRecurring: true, isEstimate: false, status: 'confirmed' },
    ],
    AT: [
        { id: 't1', description: 'Miete', amount: 1300, currency: 'EUR', date: '2024-08-01', type: 'expense', isRecurring: true, isEstimate: false, status: 'pending' },
        { id: 't2', description: 'Energie', amount: 180, currency: 'EUR', date: '2024-08-15', type: 'expense', isRecurring: true, isEstimate: true, status: 'pending' },
        { id: 't3', description: 'Internet & TV', amount: 60, currency: 'EUR', date: '2024-08-10', type: 'expense', isRecurring: true, isEstimate: false, status: 'confirmed' },
    ],
    CH: [
        { id: 't1', description: 'Mietzins', amount: 2200, currency: 'CHF', date: '2024-08-01', type: 'expense', isRecurring: true, isEstimate: false, status: 'pending' },
        { id: 't2', description: 'Nebenkosten', amount: 250, currency: 'CHF', date: '2024-08-15', type: 'expense', isRecurring: true, isEstimate: true, status: 'pending' },
        { id: 't3', description: 'Internet/TV Abo', amount: 75, currency: 'CHF', date: '2024-08-10', type: 'expense', isRecurring: true, isEstimate: false, status: 'confirmed' },
    ]
};

const appointments: Appointment[] = [
    { id: 'a1', date: '2024-09-10T10:00:00', patient: 'Anna Schmidt', doctor: 'Dr. med. Eva Wunderlich', purpose: 'Vorsorgeuntersuchung' },
    { id: 'a2', date: '2024-09-12T14:30:00', patient: 'Max Schmidt', doctor: 'Dr. dent. Klaus Zahn', purpose: 'Zahnreinigung' },
    { id: 'a3', date: '2024-09-25T09:00:00', patient: 'Anna Schmidt', doctor: 'Augenarzt Dr. Weitblick', purpose: 'Kontrolle' },
];

const healthInsurancesData: { [key in Region]: HealthInsurance[] } = {
    DE: [
        { id: 'hi1', memberName: 'Anna Schmidt', provider: 'GesundheitKasse Plus', policyNumber: 'G123456789', type: 'gesetzlich' },
        { id: 'hi2', memberName: 'Max Schmidt', provider: 'PrivatSorglos AG', policyNumber: 'P987654321', type: 'privat' },
    ],
    AT: [
        { id: 'hi1', memberName: 'Anna Schmidt', provider: 'Österreichische Gesundheitskasse', policyNumber: 'SVNR 12345', type: 'gesetzlich' },
        { id: 'hi2', memberName: 'Max Schmidt', provider: 'UNIQA', policyNumber: 'POL98765', type: 'privat' },
    ],
    CH: [
        { id: 'hi1', memberName: 'Anna Schmidt', provider: 'Helsana', policyNumber: 'AVS-123.456', type: 'Grundversicherung' },
        { id: 'hi2', memberName: 'Max Schmidt', provider: 'Visana', policyNumber: 'AVS-789.012', type: 'Grundversicherung' },
    ]
};

const emergencyContactsData: { [key in Region]: EmergencyContact[] } = {
    DE: [
        { id: 'ec1', name: 'Dr. med. Eva Wunderlich', specialty: 'Allgemeinmedizin', phone: '0123 456 7890', type: 'doctor' },
        { id: 'ec2', name: 'Zentral-Krankenhaus', specialty: 'Notaufnahme', phone: '112', type: 'hospital' },
        { id: 'ec3', name: 'Kinderarzt Dr. Fröhlich', specialty: 'Pädiatrie', phone: '0123 987 6543', type: 'doctor' },
    ],
    AT: [
        { id: 'ec1', name: 'Dr. Markus Huber', specialty: 'Praktischer Arzt', phone: '+43 1 234567', type: 'doctor' },
        { id: 'ec2', name: 'Rettung', specialty: 'Notruf', phone: '144', type: 'emergency' },
        { id: 'ec3', name: 'Ärztefunkdienst', specialty: 'Bereitschaft', phone: '141', type: 'doctor' },
    ],
    CH: [
        { id: 'ec1', name: 'Dr. med. Peter Muster', specialty: 'Hausarzt', phone: '+41 44 123 45 67', type: 'doctor' },
        { id: 'ec2', name: 'Sanitätsnotruf', specialty: 'Ambulanz', phone: '144', type: 'emergency' },
        { id: 'ec3', name: 'Universitätsspital', specialty: 'Notfall', phone: '+41 44 255 11 11', type: 'hospital' },
    ]
}

const forecastData: { [key in Region]: ForecastDataPoint[] } = {
    DE: [
      { date: 'Aug', value: 125500, income: 6000, expenses: 4000 }, { date: 'Sep', value: 127500, income: 6000, expenses: 4000 }, { date: 'Okt', value: 129500, income: 6000, expenses: 4000 }, { date: 'Nov', value: 131500, income: 6000, expenses: 4000 }, { date: 'Dez', value: 133500, income: 6000, expenses: 4000 }, { date: 'Jan', value: 135500, income: 6000, expenses: 4000 },
    ],
    AT: [
      { date: 'Aug', value: 122500, income: 5500, expenses: 3800 }, { date: 'Sep', value: 124200, income: 5500, expenses: 3800 }, { date: 'Okt', value: 125900, income: 5500, expenses: 3800 }, { date: 'Nov', value: 127600, income: 5500, expenses: 3800 }, { date: 'Dez', value: 129300, income: 5500, expenses: 3800 }, { date: 'Jan', value: 131000, income: 5500, expenses: 3800 },
    ],
    CH: [
      { date: 'Aug', value: 139000, income: 8000, expenses: 5000 }, { date: 'Sep', value: 142000, income: 8000, expenses: 5000 }, { date: 'Okt', value: 145000, income: 8000, expenses: 5000 }, { date: 'Nov', value: 148000, income: 8000, expenses: 5000 }, { date: 'Dez', value: 151000, income: 8000, expenses: 5000 }, { date: 'Jan', value: 154000, income: 8000, expenses: 5000 },
    ],
};


export const getDataForRegion = (region: Region) => ({
    assets: assetsData[region],
    recurringExpenses: recurringExpensesData[region],
    appointments: appointments, // Assuming appointments are the same for all regions for now
    healthInsurances: healthInsurancesData[region],
    emergencyContacts: emergencyContactsData[region],
    forecastData: forecastData[region]
});
