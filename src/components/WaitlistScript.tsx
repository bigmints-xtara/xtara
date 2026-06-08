import Script from "next/script";

const WaitlistScript = () => {
  return (
    <Script
      src="https://waitlist.saveaday.ai/embed/75bab487d01a9e0fdbd7657e.js"
      data-waitlist-token="75bab487d01a9e0fdbd7657e"
      strategy="afterInteractive"
    />
  );
};

export default WaitlistScript;
