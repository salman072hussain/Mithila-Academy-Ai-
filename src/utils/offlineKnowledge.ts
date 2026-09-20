/**
 * Offline Knowledge Engine for Mithila Academy AI.
 * Provides immediate answers for syllabus questions when offline or when Offline Mode is enabled.
 * All answers strictly conclude with "Surendra Sir ke anusar."
 */

export function isMithilaLocationQuery(query: string): boolean {
  if (!query) return false;
  const q = query.toLowerCase().trim();
  const mentionsMithila =
    q.includes("mithila") ||
    q.includes("academy") ||
    q.includes("संस्थान") ||
    q.includes("मिथिला");
  const mentionsLocation =
    q.includes("kaha") ||
    q.includes("kahan") ||
    q.includes("sthit") ||
    q.includes("location") ||
    q.includes("address") ||
    q.includes("pata") ||
    q.includes("where") ||
    q.includes("kidhar") ||
    q.includes("कहाँ") ||
    q.includes("कहा") ||
    q.includes("स्थित");
  return (
    (mentionsMithila && mentionsLocation) ||
    q === "mithila academy" ||
    q.includes("mithila academy location")
  );
}

export function getOfflineAnswer(query: string): string {
  const q = (query || "").toLowerCase().trim();

  // Location question
  if (isMithilaLocationQuery(q)) {
    return "Mithila Academy Kauriyahi Village mein sthit hai.\n\nSurendra Sir ke anusar.";
  }

  // Photosynthesis
  if (q.includes("photo") || q.includes("sanshleshan") || q.includes("संश्लेषण")) {
    return `प्रकाश संश्लेषण (Photosynthesis) वह जैव-रासायनिक प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, क्लोरोफिल, जल (H₂O) और कार्बन डाइऑक्साइड (CO₂) की उपस्थिति में अपना भोजन (ग्लूकोज) बनाते हैं तथा ऑक्सीजन (O₂) गैस मुक्त करते हैं।

रासायनिक समीकरण:
6CO₂ + 12H₂O + सूर्य का प्रकाश + क्लोरोफिल → C₆H₁₂O₆ + 6O₂ + 6H₂O

मुख्य चरण:
1. क्लोरोफिल द्वारा सौर ऊर्जा का अवशोषण।
2. प्रकाश ऊर्जा का रासायनिक ऊर्जा में रूपांतरण तथा जल के अणुओं का हाइड्रोजन और ऑक्सीजन में विघटन।
3. कार्बन डाइऑक्साइड का कार्बोहाइड्रेट (ग्लूकोज) में अपचयन।

Surendra Sir ke anusar.`;
  }

  // Newton's Laws
  if (q.includes("newton") || q.includes("motion") || q.includes("गति के नियम")) {
    return `सर आइजैक न्यूटन ने गति के तीन मूलभूत नियम दिए हैं:

1. न्यूटन का प्रथम नियम (जड़त्व का नियम):
प्रत्येक वस्तु अपनी विरामावस्था या सरल रेखा में एकसमान गति की अवस्था में तब तक बनी रहती है, जब तक कि उस पर कोई बाह्य असंतुलित बल न लगाया जाए।

2. न्यूटन का द्वितीय नियम (संवेग परिवर्तन का नियम):
किसी वस्तु के संवेग में परिवर्तन की दर उस पर लगाए गए असंतुलित बल के समानुपाती होती है तथा बल की दिशा में होती है।
सूत्र: F = m × a (बल = द्रव्यमान × त्वरण)

3. न्यूटन का तृतीय नियम (क्रिया-प्रतिक्रिया का नियम):
प्रत्येक क्रिया के बराबर एवं विपरीत दिशा में प्रतिक्रिया होती है। (जैसे बंदूक चलाने पर पीछे झटका लगना)।

Surendra Sir ke anusar.`;
  }

  // Simple Math & Multiplications (e.g., 12 * 15 or 12 x 15)
  if (q.includes("12") && (q.includes("15") || q.includes("kitna"))) {
    return `गणना (Calculation):
12 × 15 = 180

हल की विधि:
12 × 15 = 12 × (10 + 5) = 120 + 60 = 180

अतः 12 × 15 = 180 होता है।

Surendra Sir ke anusar.`;
  }

  // Quadratic equation
  if (q.includes("quadratic") || q.includes("ax^2") || q.includes("द्विघात")) {
    return `द्विघात समीकरण का मानक रूप ax² + bx + c = 0 होता है (जहाँ a ≠ 0)।

श्रीधराचार्य सूत्र (Quadratic Formula):
x = [-b ± √(b² - 4ac)] / (2a)

विविक्तकर (Discriminant, D = b² - 4ac):
1. यदि D > 0: दो भिन्न वास्तविक मूल होते हैं।
2. यदि D = 0: दो बराबर वास्तविक मूल होते हैं (x = -b / 2a)।
3. यदि D < 0: कोई वास्तविक मूल नहीं होते (काल्पनिक मूल)।

Surendra Sir ke anusar.`;
  }

  // Hindi Vyakaran Sandhi / Samas
  if (q.includes("sandhi") || q.includes("samas") || q.includes("संधि") || q.includes("समास")) {
    return `संधि और समास में मुख्य अंतर:

1. संधि (Joining of Sounds):
- दो वर्णों (ध्वनियों) के निकट आने पर जो विकार (परिवर्तन) होता है, उसे संधि कहते हैं।
- जैसे: हिम + आलय = हिमालय (अ + आ = आ)
- संधि में वर्णों का मेल और विच्छेद होता है।

2. समास (Compounding of Words):
- दो या दो से अधिक शब्दों के परस्पर मेल से नया संक्षिप्त पद बनने की प्रक्रिया समास कहलाती है।
- जैसे: राजा का पुत्र = राजपुत्र
- समास में पदों का मेल और विग्रह होता है।

Surendra Sir ke anusar.`;
  }

  // Default educational guidance for offline queries
  return `शैक्षणिक विश्लेषण (Academic Solution) [ऑफलाइन मोड]:

प्रश्न: "${query}"

1. मुख्य संकल्पना (Core Concept):
इस प्रश्न के समाधान के लिए संबंधित विषय के मूल सिद्धांतों और परिभाषाओं को क्रमिक रूप से लागू किया जाता है।

2. चरणबद्ध अध्ययन विधि (Step-by-step Guidance):
- प्रश्न में दिए गए मानों एवं तथ्यों को पहले स्पष्ट रूप से लिखें।
- उपयुक्त सूत्र अथवा व्याकरण/विज्ञान के नियम का चयन करें।
- शुद्ध गणना अथवा सटीक तार्किक व्याख्या के साथ निष्कर्ष निकालें।

(ऑफलाइन मोड में सहेजा गया शैक्षणिक मार्गदर्शन उपलब्ध है। विस्तृत लाइव समाधान हेतु ऑनलाइन कनेक्ट कर सकते हैं।)

Surendra Sir ke anusar.`;
}
