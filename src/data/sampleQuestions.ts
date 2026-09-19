import { SubjectCategory } from "../types";

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    id: "maths",
    name: "Mathematics",
    hindiName: "गणित",
    iconName: "Calculator",
    color: "from-blue-600 to-indigo-700",
    examples: [
      "द्विघात समीकरण 2x² + 5x + 3 = 0 को हल कीजिए।",
      "Explain the Pythagorean theorem with a real-life example.",
      "त्रिभुज के क्षेत्रफल का हेरॉन का सूत्र (Heron's Formula) क्या है?",
      "Find the derivative of f(x) = 3x² + 5x - 7 step by step.",
    ],
  },
  {
    id: "science",
    name: "Science",
    hindiName: "विज्ञान",
    iconName: "FlaskConical",
    color: "from-emerald-600 to-teal-700",
    examples: [
      "प्रकाश संश्लेषण (Photosynthesis) की प्रक्रिया को समझाइए।",
      "What is Newton's Second Law of Motion? Give calculations with F = ma.",
      "अम्ल और क्षार (Acids and Bases) में क्या मुख्य अंतर होता है?",
      "Why does a pencil appear bent in a glass of water? Explain refraction.",
    ],
  },
  {
    id: "english",
    name: "English & Grammar",
    hindiName: "अंग्रेजी व्याकरण",
    iconName: "BookOpen",
    color: "from-purple-600 to-pink-700",
    examples: [
      "Explain the difference between 'Present Perfect' and 'Simple Past' tense.",
      "Active voice se Passive voice me convert karne ke niyam kya hain?",
      "Write a formal application to the Principal for 3 days sick leave.",
      "What are metaphors and similes? Give 2 examples of each.",
    ],
  },
  {
    id: "social",
    name: "Social Studies",
    hindiName: "सामाजिक अध्ययन",
    iconName: "Globe",
    color: "from-amber-600 to-orange-700",
    examples: [
      "1857 की क्रांति के मुख्य कारण क्या थे?",
      "What is the difference between Weather and Climate?",
      "भारतीय संविधान के मौलिक अधिकार (Fundamental Rights) कौन-से हैं?",
      "Explain the water cycle and its importance for nature.",
    ],
  },
  {
    id: "hindi",
    name: "Hindi & Sanskrit",
    hindiName: "हिंदी व्याकरण",
    iconName: "PenTool",
    color: "from-rose-600 to-red-700",
    examples: [
      "संधि और समास में क्या अंतर है? सोदाहरण समझाइए।",
      "कारक किसे कहते हैं? इसके भेदों के नाम और विभक्ति चिन्ह बताइए।",
      "अलंकार की परिभाषा और इसके मुख्य भेद समझाइए।",
      "मुहावरे 'आस्तीन का सांप' और 'ईद का चांद' का अर्थ और वाक्य प्रयोग।",
    ],
  },
];

export const POPULAR_PROMPTS = [
  "📐 द्विघात समीकरण कैसे हल करते हैं?",
  "⚡ Ohm's Law and its mathematical formula",
  "🌿 Mitochondria ko cell ka powerhouse kyu kehte hain?",
  "✍️ Letter writing format for school exam",
];
