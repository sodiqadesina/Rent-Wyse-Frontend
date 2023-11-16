export interface post {
   _id: string;
   title: string;
   description?: string; // Changed from content to description
   imagePath: any[];
   creator: any;
   bedroomNumber?: number; // New field
   bathroomNumber?: number; // New field
   typeOfProperty?: string; // New field
   furnished?: boolean; // New field
   parkingAvailable?: boolean; // New field
   rentType?: string; // New field
   dateListed?: Date; // New field
   dateAvailableForRent?: Date; // New field
   city?: string;
   address?: string;
   province?: string;
   zipcode?: string;
   country?: string;
   content?: string; //removing when change complete
 }
 