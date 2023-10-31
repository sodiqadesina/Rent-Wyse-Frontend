   export interface post {
    _id: string, 
    title: string,
    content: string,
    imagePath: any[],
    creator: any,
    city?: string,
    address?: string,
    province?: string,
    zipcode?: string,
    country?: string
   }