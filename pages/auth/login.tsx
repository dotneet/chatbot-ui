import { getCsrfToken, getProviders, signIn } from 'next-auth/react';

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '../api/auth/[...nextauth]';

export default function Login({
  csrfToken,
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-white text-center text-2xl font-bold leading-9 tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form
              method="post"
              className="space-y-6"
              action="/api/auth/callback/credentials"
            >
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    required
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    required
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div>
              <div className="relative mt-10">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-6 text-gray-900">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => signIn(providers?.google?.id)}
                  className="flex w-full shadow-sm ring-1 ring-inset ring-gray-300 items-center justify-center gap-3 rounded-md px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_9_516)">
                      <path
                        d="M19.8052 10.2304C19.8052 9.55059 19.7501 8.86714 19.6325 8.19839H10.2002V12.0492H15.6016C15.3775 13.2912 14.6573 14.3898 13.6027 15.088V17.5866H16.8252C18.7176 15.8449 19.8052 13.2728 19.8052 10.2304Z"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M10.1999 20.0007C12.897 20.0007 15.1714 19.1151 16.8286 17.5866L13.6061 15.0879C12.7096 15.6979 11.5521 16.0433 10.2036 16.0433C7.59474 16.0433 5.38272 14.2832 4.58904 11.9169H1.26367V14.4927C2.96127 17.8695 6.41892 20.0007 10.1999 20.0007V20.0007Z"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M4.58565 11.9169C4.16676 10.675 4.16676 9.33011 4.58565 8.08814V5.51236H1.26395C-0.154389 8.33801 -0.154389 11.6671 1.26395 14.4927L4.58565 11.9169V11.9169Z"
                        fill="#FBBC04"
                      ></path>
                      <path
                        d="M10.1999 3.95805C11.6256 3.936 13.0035 4.47247 14.036 5.45722L16.8911 2.60218C15.0833 0.904587 12.6838 -0.0287217 10.1999 0.000673888C6.41892 0.000673888 2.96127 2.13185 1.26367 5.51234L4.58537 8.08813C5.37538 5.71811 7.59107 3.95805 10.1999 3.95805V3.95805Z"
                        fill="#EA4335"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_9_516">
                        <rect width="20" height="20" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-sm font-semibold leading-6">
                    Google
                  </span>
                </button>
                <button
                  onClick={() => signIn(providers?.github?.id)}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                >
                  <svg
                    className="h-5 w-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold leading-6">
                    GitHub
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) {
    return { redirect: { destination: '/' } };
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

  return {
    props: { providers: providers ?? [], csrfToken },
  };
}
