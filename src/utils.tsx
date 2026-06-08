import React from 'react';
import {
  AtSign,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

export const getImagePath = (imagePath: string): string => {
  return imagePath;
};

export const getPlatformIconByName = (platformName: string): React.ReactNode | null => {
  switch (platformName) {
    case "facebook":
      return <Facebook size={24} className="min-w-fit" />;
    case "github":
      return <Github size={24} className="min-w-fit" />;
    case "instagram":
      return <Instagram size={24} className="min-w-fit" />;
    case "linkedin":
      return <Linkedin size={24} className="min-w-fit" />;
    case "threads":
      return <AtSign size={24} className="min-w-fit" />;
    case "twitter":
    case "x":
      return <Twitter size={24} className="min-w-fit" />;
    case "youtube":
      return <Youtube size={24} className="min-w-fit" />;
    default:
      return null;
  }
};
