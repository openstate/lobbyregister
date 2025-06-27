import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logoutUser } from '../../utils/authentication';

export const POST: RequestHandler = ( event ) => {
    logoutUser(event.cookies);    
    redirect(303, '/');
}