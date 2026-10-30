// Customers Database for GK Auto Spares

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-1001',
    name: 'Sri Balaji Auto Garage',
    contactPerson: 'Senthil Nathan',
    phone: '+91 98421 11223',
    email: 'balajiauto.kumily@gmail.com',
    vehicleNo: 'KL-06-H-8842',
    vehicleModel: 'Piaggio Ape Cargo & Passenger Fleet',
    customerType: 'GARAGE',
    creditLimit: 50000,
    currentOutstanding: 12400.00,
    address: '1st Mile, Kumily Bypass Road, Idukki'
  },
  {
    id: 'CUST-1002',
    name: 'Sharma Transport & Auto Works',
    contactPerson: 'Manoj Sharma',
    phone: '+91 94432 44556',
    email: 'sharma.transport@gmail.com',
    vehicleNo: 'TN-57-AB-3921',
    vehicleModel: 'Commercial 3-Wheelers & Ace Fleet',
    customerType: 'GARAGE',
    creditLimit: 75000,
    currentOutstanding: 18200.00, // already high credit
    address: 'Near Check Post, Kumily Town'
  },
  {
    id: 'CUST-1003',
    name: 'Kannan Two Wheeler Care',
    contactPerson: 'Kannan P.',
    phone: '+91 97890 55667',
    email: 'kannan.bikes@outlook.com',
    vehicleNo: 'KL-06-M-5102',
    vehicleModel: 'Honda Activa, Splendor, Pulsar Specialist',
    customerType: 'GARAGE',
    creditLimit: 30000,
    currentOutstanding: 4500.00,
    address: 'Opp. KSRTC Bus Stand, Kumily'
  },
  {
    id: 'CUST-1004',
    name: 'Highland Tourist Auto Fleet',
    contactPerson: 'Alex Varghese',
    phone: '+91 98460 77889',
    email: 'highland.fleet@gmail.com',
    vehicleNo: 'KL-06-Q-2410',
    vehicleModel: 'Ape Auto Rickshaw Fleet (12 Autos)',
    customerType: 'FLEET_OWNER',
    creditLimit: 60000,
    currentOutstanding: 8900.00,
    address: 'Amaravathi PO, Kumily'
  },
  {
    id: 'CUST-1005',
    name: 'Ramesh Kumar (Retail Customer)',
    contactPerson: 'Ramesh Kumar',
    phone: '+91 98450 12890',
    email: 'ramesh.k22@gmail.com',
    vehicleNo: 'KL-06-N-7714',
    vehicleModel: 'Honda Activa 6G (2022)',
    customerType: 'RETAIL',
    creditLimit: 15000,
    currentOutstanding: 0.00,
    address: 'Thekkady Road, Kumily'
  },
  {
    id: 'CUST-1006',
    name: 'Praveen George (Retail Customer)',
    contactPerson: 'Praveen George',
    phone: '+91 98471 99120',
    email: 'praveen.george@gmail.com',
    vehicleNo: 'KL-06-R-9021',
    vehicleModel: 'Royal Enfield Classic 350',
    customerType: 'RETAIL',
    creditLimit: 15000,
    currentOutstanding: 0.00,
    address: 'Spring Valley, Kumily'
  }
];
