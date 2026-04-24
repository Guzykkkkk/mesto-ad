const cohortId = import.meta.env.VITE_MESTO_COHORT_ID;
const token = import.meta.env.VITE_MESTO_TOKEN;
const baseApiUrl = import.meta.env.VITE_MESTO_BASE_URL;

export const config = {
    baseUrl: `${baseApiUrl}/${cohortId}`,
    headers: {
        authorization: token,
        "Content-Type": "application/json",
    },
};