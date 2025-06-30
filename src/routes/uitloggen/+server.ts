import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logoutUser } from '../../utils/authenticationUtils';

export const POST: RequestHandler = ( event ) => {
    logoutUser(event.cookies);    
    redirect(303, '/');
}