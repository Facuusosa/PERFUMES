import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_v8y93jFYE8Uu637kHbt73Lo98g9NL7zFZ6pBLEoyvADD';
const POSTHOG_HOST = 'https://us.i.posthog.com';
const CLARITY_PROJECT_ID = 'yan3h9lnsm';

export function initAnalytics() {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
  });

  const clarityScript = document.createElement('script');
  clarityScript.textContent = `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;
  document.head.appendChild(clarityScript);
}

export { posthog };
