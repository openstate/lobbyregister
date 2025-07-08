import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { zfd } from 'zod-form-data';
import type { Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { AuthenticatedUserTypes, type Official } from '../../types';
import { loginUser } from '../../utils/authenticationUtils';
import { redirectPath, type REDIRECTS } from '../../utils/routingUtils';

const loginOfficialSchema = zfd.formData({
  username: zfd.text(),
  password: zfd.text(),
  fromPage: zfd.text().optional(),
  fromPageParams: z.preprocess((value) => JSON.parse(value as string), z.record(z.string(), z.string())).optional(),
});

async function getOfficials() {
  const users = await db
    .select({
      id: schema.officials.id,
      name: schema.officials.name,
      type: schema.officials.type
    })
    .from(schema.officials)
    .where(eq(schema.officials.active, true))
    .orderBy(schema.officials.name);

  return users.map((user) => {
    let official: Official = {
      id: user.id,
      name: user.name,
      type: user.type
    };
    return official;
  });
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const parsed = loginOfficialSchema.safeParse(await request.formData());

    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return fail(400, {
        message: 'Ongeldige gegevens. Controleer of alle vereiste velden zijn ingevuld.'
      });
    }

    // Note that in this demo the username is the user_id
    const { username, password, fromPage, fromPageParams } = parsed.data;

    if (password == process.env.DEMO_LOGIN_PASSWORD) {
      loginUser(cookies, username, AuthenticatedUserTypes.official);
      return redirect(302, redirectPath(fromPage as REDIRECTS, fromPageParams));
    } else {
      console.error("Credentials not correct for " + username);
      return fail(400, {
        message: 'Gebruikersnaam en/of wachtwoord niet juist'
      });
    }
  },
};

export const load: PageServerLoad = async ({ params, url }) => {
  const fromPage = url.searchParams.get('fromPage')
  const fromPageParams = url.searchParams.get('fromPageParams')
  const users = await getOfficials();
	return { users, fromPage, fromPageParams };
};
