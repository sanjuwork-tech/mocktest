import {currentAdmin} from '@/server/auth';
export async function isAdmin(){return Boolean(await currentAdmin());}
