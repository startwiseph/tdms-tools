
import Image from "next/image";
import Link from "next/link";
import path from "path";
import fs from "fs";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";

// Configurable metadata that can be easily adjusted per project
export const metadata = {
  title: "Privacy Policy",
  description: "Our commitment to protecting your privacy and personal data.",
};

export default async function PrivacyPolicy() {
  // Configurable path to markdown file
  const filePath = path.join(process.cwd(), "public", "privacy.md");
  const fileContent = fs.readFileSync(filePath, "utf8");

  return (
    <main className={`min-h-screen bg-brand-2 text-white bg-[#154a8f]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Back Button - only visible on mobile */}
        <div className="lg:hidden fixed top-6 left-6 z-10">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="w-10 h-10" />
          </Link>
        </div>

        <div className="lg:flex lg:gap-8">
          {/* Left column - fixed on desktop */}
          <div className="hidden lg:block lg:w-1/3 pt-12">
            <div className="sticky top-56">
              <Image
                src="/images/logo.png"
                alt="TDMS Tools Logo"
                width={1000}
                height={1000}
                className="w-52 h-52 object-contain"
              />
              <h1 className={`mt-3 text-4xl font-extrabold`}>
                {metadata.title}
              </h1>
              <p className={`mt-2 text-md leading-tight`}>
                {metadata.description}
              </p>
            </div>
          </div>

          {/* Right column - scrollable content */}
          <div className="lg:w-2/3 py-44">
            {/* Mobile/Tablet header */}
            <div className="lg:hidden mb-8 pl-6">
              <Image
                src="/images/logo.png"
                alt="ENC Logo"
                width={1000}
                height={1000}
                className="w-52 h-52 object-contain"
              />
              <h1 className={`mt-3 text-4xl font-extrabold`}>
                {metadata.title}
              </h1>
              <p className={`mt-2 text-lg leading-tight`}>
                {metadata.description}
              </p>
            </div>

            {/* Content */}
            <div className="overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <ReactMarkdown
                  components={{
                    h2: ({ ...props }) => (
                      <h2
                        className="text-2xl font-bold mt-8 mb-4 text-bc-1"
                        {...props}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        className="text-xl font-semibold mt-6 mb-3 pl-5 text-bc-1"
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-base mb-4 pl-10" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc mb-4 pl-20" {...props} />
                    ),
                    li: ({ ...props }) => (
                      <li className="mb-2" {...props} />
                    ),
                    a: ({ ...props }) => (
                      <a className={`hover:underline`} {...props} />
                    ),
                  }}
                >
                  {fileContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
