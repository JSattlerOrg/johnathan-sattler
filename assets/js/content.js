/*
 * ─────────────────────────────────────────────────────────────
 *  SattlerOS · content
 *  Everything personal on the site lives in this one file.
 *  Edit the values below — no build step needed. Anything marked
 *  "TODO" is placeholder text that should be replaced.
 * ─────────────────────────────────────────────────────────────
 */
window.SITE = {
  name: "Johnathan Sattler",
  firstName: "Johnathan",
  initials: "JS",
  osName: "SattlerOS",

  // Profile photo. Any image URL works (e.g. "assets/img/me.jpg" or your GitHub
  // avatar "https://avatars.githubusercontent.com/u/9040502?v=4").
  // Leave empty to show your initials on a gradient.
  avatar: "",

  // TODO: a short line about what you do, e.g. "Software engineer & weekend woodworker"
  headline: "Builder · Tinkerer · Always learning",

  // TODO: e.g. "Chicago, IL" — leave empty to hide
  location: "",

  // TODO: add a public email address to enable the Mail app and the Messages "send" button.
  email: "",

  // Shown in the "Now" widget on the home screen.
  now: {
    label: "Currently",
    text: "Just launched this site. Poke around!",
  },

  // About app
  about: [
    "Hi, I'm Johnathan 👋 Welcome to my little corner of the internet.",
    "This site is built to feel like the phone in your pocket: open the apps, swipe between pages, try the calculator, or type help in the Terminal.",
    // TODO: add a few sentences about yourself — what you do, what you care about, what you're into.
    "This is where I share what I'm working on, things I've learned, and ways to get in touch.",
  ],

  // Small key/value rows in the About app. Empty values are hidden.
  facts: [
    { label: "Website", value: "jsattlerorg.github.io/johnathan-sattler", url: "https://jsattlerorg.github.io/johnathan-sattler/" },
    { label: "GitHub", value: "@JohnathanSattler", url: "https://github.com/JohnathanSattler" },
    // TODO: { label: "Focus", value: "Web, design & systems" },
  ],

  // Projects app (styled like App Store "Today" cards)
  projects: [
    {
      name: "SattlerOS",
      eyebrow: "This website",
      description:
        "A tiny operating system for the web, built with plain HTML, CSS and JavaScript — no frameworks, no build step — and hosted on GitHub Pages.",
      tags: ["HTML", "CSS", "JavaScript"],
      url: "https://github.com/jsattlerorg/johnathan-sattler",
      colors: ["#5e5ce6", "#bf5af2"],
      emoji: "📱",
    },
    {
      // TODO: replace with a real project
      name: "Your next project",
      eyebrow: "Coming soon",
      description: "Add projects to assets/js/content.js — each one gets its own card here.",
      tags: ["Placeholder"],
      url: "",
      colors: ["#ff9f0a", "#ff375f"],
      emoji: "🚀",
    },
    {
      name: "GitHub",
      eyebrow: "Open source",
      description: "Browse my public repositories and experiments.",
      tags: ["Code"],
      url: "https://github.com/JohnathanSattler",
      colors: ["#30d158", "#0a84ff"],
      emoji: "🧪",
    },
  ],

  // Résumé app. Newest first.
  // TODO: replace these placeholders with real roles (or set to [] to show an empty state).
  experience: [
    {
      role: "Your Current Role",
      org: "Company Name",
      period: "20XX — Present",
      summary: "One or two lines about what you do and the impact you have.",
      color: "#0a84ff",
    },
    {
      role: "Previous Role",
      org: "Another Company",
      period: "20XX — 20XX",
      summary: "Highlights, technologies, or achievements worth mentioning.",
      color: "#30d158",
    },
    {
      role: "Degree or Certification",
      org: "School / Program",
      period: "20XX",
      summary: "Education, bootcamps, or certifications.",
      color: "#ff9f0a",
    },
  ],
  skills: ["JavaScript", "HTML & CSS", "Git", "Problem solving"], // TODO
  resumeUrl: "", // TODO: link to a PDF (e.g. "assets/resume.pdf") to show a download button

  // Notes app (a lightweight blog). Separate paragraphs with a blank line.
  notes: [
    {
      title: "Hello, world",
      date: "2026-10-09",
      body:
        "This site just launched! It's designed like a phone operating system — the home screen, the apps, even the lock screen.\n\nEverything is plain HTML, CSS and JavaScript served by GitHub Pages, so it's fast and easy to update.\n\nMore notes coming soon.",
    },
    {
      title: "How this site works",
      date: "2026-10-09",
      body:
        "Each \"app\" is a small view rendered from one content file. Opening an app zooms it out of its icon, just like on a phone. Links are shareable, too: try adding #/projects or #/terminal to the URL.\n\nPress / (or ⌘K) anywhere to search.",
    },
  ],

  // Photos app. Use `src` for a real image; otherwise a colorful tile is shown.
  photos: [
    { emoji: "🌅", caption: "Golden hour", colors: ["#ff9f0a", "#ff375f"] },
    { emoji: "🏔️", caption: "Up high", colors: ["#64d2ff", "#5e5ce6"] },
    { emoji: "🌊", caption: "By the water", colors: ["#0a84ff", "#30d158"] },
    { emoji: "☕", caption: "Fuel", colors: ["#a2845e", "#3a2a1a"] },
    { emoji: "💻", caption: "Workspace", colors: ["#8e8e93", "#1c1c1e"] },
    { emoji: "🌲", caption: "Outside", colors: ["#30d158", "#1f5f3a"] },
    { emoji: "🎧", caption: "On repeat", colors: ["#bf5af2", "#5e5ce6"] },
    { emoji: "🌙", caption: "Late night", colors: ["#1c1c3a", "#5e5ce6"] },
    { emoji: "📚", caption: "Reading list", colors: ["#ff453a", "#ff9f0a"] },
  ],

  // Safari app "Favorites". Entries without a url are hidden.
  links: [
    { label: "GitHub", url: "https://github.com/JohnathanSattler", color: "#1c1c1e", glyph: "GH" },
    { label: "LinkedIn", url: "", color: "#0a66c2", glyph: "in" }, // TODO
    { label: "X / Twitter", url: "", color: "#000000", glyph: "𝕏" }, // TODO
    { label: "Instagram", url: "", color: "#e1306c", glyph: "IG" }, // TODO
    { label: "Source", url: "https://github.com/jsattlerorg/johnathan-sattler", color: "#5e5ce6", glyph: "</>" },
  ],

  // The conversation shown when someone opens Messages.
  messages: [
    "Hey! 👋",
    "Thanks for stopping by my site.",
    "Feel free to look around — and if you want to say hi, type below.",
  ],

  // Playful "battery" widget on the second home page.
  levels: [
    { label: "Curiosity", value: 100, color: "#30d158" },
    { label: "Coffee", value: 72, color: "#ff9f0a" },
    { label: "Sleep", value: 41, color: "#0a84ff" },
  ],
};
