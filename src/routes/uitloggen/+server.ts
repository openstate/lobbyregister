import { redirect } from 'sveltekit-flash-message/server'
import type { RequestHandler } from './$types';
import { logoutUser } from '../../utils/authenticationUtils';

export const POST: RequestHandler = ( event ) => {
    logoutUser(event.cookies);    

    const message = "U bent nu uitgelogd";
    redirect(303, '/', {type: 'success', message: message}, event.cookies);
}