export interface Avatar {
   profile: Profile;
   experience: Experience[];
}

export interface Profile {
   name: string;
   age: number;
   bio: string;
   personality: string;
}

export interface Experience {
   company: string;
   role: string;
   period: string;
   jobDescription: string;
}
