/* PatCh.BaGs — additive editorial interactions and two-way Arabic/English UI.
   No changes to the original catalog, checkout rules, authentication or storage. */
(function(){
'use strict';
const translations={
 'Skip to content':'تخطي إلى المحتوى',
 'Handcrafted with care in Alexandria, Egypt':'مصنوع يدويًا بحب في الإسكندرية',
 'Made to feel personal':'تفاصيل تشبهك',
 'HANDMADE STUDIO':'استوديو الهاند ميد',
 'Shop collection':'تسوقي المجموعة',
 'Our story':'حكايتنا',
 'Personalize':'خصّصي قطعتك',
 'Contact':'تواصلي معنا',
 'Search products':'البحث عن المنتجات',
 'Open enquiry list':'افتحي حقيبتك',
 'Open navigation':'افتحي القائمة',
 'Close navigation':'إغلاق القائمة',
 'My picks':'اختياراتي',
 'Search the collection':'ابحثي في المجموعة',
 'PATCh.BaGs · HANDMADE IN ALEXANDRIA':'باتش باجز · صناعة يدوية من الإسكندرية',
 'A little more':'لمسة أكتر',
 'you.':'شبهك.',
 'Small details. Beautifully handmade. A piece of everyday joy, made yours.':'تفاصيل صغيرة معمولة بحب علشان تبقى جزء جميل من كل يوم',
 'Explore the collection':'اكتشفي المجموعة',
 'Meet the maker':'اتعرفي علينا',
 'Made with intention':'تصميم بإحساس',
 'Handmade in Alexandria':'صناعة يدوية في الإسكندرية',
 'SCROLL TO EXPLORE':'اسحبي لاكتشاف المزيد',
 '01 / THE EVERYDAY EDIT':'01 / تفاصيل كل يوم',
 'HANDMADE / SINCE THE BEGINNING':'هاند ميد من أول يوم',
 'Made by hand':'شغل إيد',
 'Made with heart':'بكل حب',
 'Made to be yours':'اتعملت علشانك',
 'THE PATCH EDIT':'اختيارات باتش',
 'Find your kind of':'اختاري القطعة اللي',
 'handmade.':'تشبهك.',
 '01 / CARRY':'01 / شنط',
 '02 / KEEP':'02 / تفاصيل',
 '03 / MAKE IT YOURS':'03 / على ذوقك',
 'Bags':'شنط',
 'Little essentials':'إكسسوارات بسيطة',
 'Personalized':'منتجات مخصصة',
 'Explore ↗':'اكتشفي ↗',
 'THE COLLECTION':'المجموعة',
 'A closer':'بصي على',
 'look.':'التفاصيل.',
 'All pieces':'كل القطع',
 'Handmade bags':'شنط هاند ميد',
 'Accessories':'إكسسوارات',
 'Seen something you love?':'عجبتك قطعة؟',
 'Ask us about it ↗':'اسألينا عنها ↗',
 'IN THE DETAILS':'جمال التفاصيل',
 'The textures':'تفاصيل بنحب',
 'we love.':'ملمسها.',
 'The craft':'الصنعة',
 'The details':'التفاصيل',
 'The little joys':'الفرحة الصغيرة',
 'THE PHOTO DIARY / PATCH.BAGS':'ألبوم باتش باجز',
 'Worn with':'اتعملت',
 'love.':'بالحب.',
 'Real pieces. Real moments. Explore the details and tap the + to see a piece up close.':'صور حقيقية وتفاصيل بتتحس اضغطي على علامة + علشان تشوفي القطعة عن قرب',
 '01 / EVERYDAY CARRY':'01 / لكل يوم',
 '02 / A TOUCH OF BLUSH':'02 / لمسة وردي',
 '03 / MADE BY HAND':'03 / شغل إيد',
 '04 / PERSONAL TOUCH':'04 / على ذوقك',
 'TAP + TO EXPLORE EACH PIECE':'اضغطي على + لاكتشاف القطع',
 'Previous lookbook image':'الصورة السابقة',
 'Next lookbook image':'الصورة التالية',
 'View the ivory woven tote':'عرض الشنطة المنسوجة الأوف وايت',
 'View the blush striped tote':'عرض الشنطة الوردية المخططة',
 'View the signature striped tote':'عرض الشنطة المخططة المميزة',
 'View the personalized initial pouch':'عرض الجراب المخصص بالحرف',
 'Ivory sculpted tote':'شنطة أوف وايت',
 'Blush striped tote':'شنطة وردية مخططة',
 'Signature striped tote':'شنطة مخططة مميزة',
 'Initial zip pouch':'جراب الحرف المخصص',
 'KIND WORDS / REAL CUSTOMER FEEDBACK':'كلام حلو من عملائنا',
 'Loved by':'بحب',
 'you.':'منكم.',
 'Notes from our customers, shared with love. Some quotes are translated from Arabic.':'رسائل جميلة من عملائنا وبعض التعليقات مترجمة من العربية',
 'CUSTOMER FEEDBACK · ORIGINAL ENGLISH':'تقييم عميلة · الأصل بالإنجليزية',
 'CUSTOMER FEEDBACK · TRANSLATED FROM ARABIC':'تقييم عميلة · مترجم من العربية',
 'HANDMADE / ALEXANDRIA':'هاند ميد / الإسكندرية',
 'Previous review':'التقييم السابق',
 'Next review':'التقييم التالي',
 'Pause automatic reviews':'إيقاف التنقل التلقائي للتقييمات',
 'JUST FOR YOU ✳':'خصوصًا علشانك ✳',
 'Make it':'خليها',
 'personal.':'شبهك.',
 'Ask about custom pieces':'اسألينا عن التصميم المخصص',
 'made for':'صُنعت لـ',
 'FOLLOW THE LITTLE THINGS':'تابعينا',
 'A little':'شوية',
 'inspiration.':'إلهام.',
 'THE STUDIO / ALEXANDRIA':'الاستوديو / الإسكندرية',
 'Made slowly.':'اتعملت بحب.',
 'Loved endlessly.':'وتعيش معاكي.',
 'At PatCh.BaGs, we believe the everyday deserves a little beauty. Thoughtfully handmade bags, soft textures and personal pieces — crafted with care, one detail at a time.':'في باتش باجز بنؤمن إن كل يوم يستاهل شوية جمال شنط وهدايا وتفاصيل شخصية معمولة بإيدينا وباهتمام بكل غرزة',
 'Our story continues on Instagram':'تابعي حكايتنا على إنستجرام',
 'THE BEAUTY OF SLOW-MADE THINGS':'جمال الحاجات المصنوعة على مهَل',
 'SLOWLY MADE · FOREVER LOVED':'مصنوعة بحب · تعيش معاكي',
 'Thoughtfully handmade bags, personal pieces and little everyday treasures.':'شنط وتفاصيل شخصية وهدايا بسيطة معمولة بإتقان',
 'Made with care in Alexandria, Egypt.':'مصنوعة بحب في الإسكندرية',
 'HAVE SOMETHING IN MIND?':'عندك فكرة؟',
 "Let's make it":"يلا نخليها",
 'yours.':'على ذوقك.',
 'Talk to the studio':'كلمينا',
 'EXPLORE':'اكتشفي',
 'Personalized pieces':'قطع مخصصة',
 'HERE TO HELP':'إحنا معاكي',
 'Ask a question':'اسألينا',
 'Customer notes':'آراء العملاء',
 'Browse handmade pieces':'تصفحي المنتجات',
 'YOUR ACCOUNT':'حسابك',
 'Sign in':'تسجيل الدخول',
 'Create account':'إنشاء حساب',
 'STAY CONNECTED':'خليكي قريبة',
 'Find the little moments behind each handmade piece.':'تابعي تفاصيل وأسرار كل قطعة هاند ميد',
 'HANDMADE IN ALEXANDRIA':'صناعة يدوية من الإسكندرية',
 'Back to top ↑':'العودة للأعلى ↑',
 'Made with ♡':'صُنع بحب ♡',
 'YOUR FAVORITES':'المفضلة',
 'Your bag':'حقيبتك',
 'THE PATCH BAG / CHECKOUT':'الشراء / باتش باجز',
 'THE PATCH EDIT':'اختيارات باتش',
 'Your selected pieces':'القطع المختارة',
 'Prices and delivery are confirmed with the studio before any payment is requested.':'السعر والتوصيل بيتأكدوا من الاستوديو قبل أي دفع',
 'Prices and availability are confirmed by the studio. This is an enquiry list, not an online checkout.':'الأسعار والتوفر بيتم تأكيدهم مع الاستوديو ودي قائمة استفسار مش دفع إلكتروني',
 'Continue to checkout':'متابعة الطلب',
 'Copy bag enquiry ↗':'نسخ الاستفسار ↗',
 'Copy my enquiry':'انسخي الاستفسار',
 'Then message us on Instagram ↗':'وبعدها ابعتيلنا على إنستجرام ↗',
 'SEARCH THE STUDIO':'ابحثي في الاستوديو',
 'Totes, book sleeves, custom...':'شنط وجرابات وحاجات مخصوصة...',
 'Product details':'تفاصيل المنتج',
 'COLOR':'اللون',
 'Photos show the selected color. Availability is confirmed by the studio.':'الصور بتعرض اللون المختار والتوفر بيتأكد مع الاستوديو',
 'HANDCRAFTED':'مصنوع يدويًا',
 'ASK FOR DETAILS & AVAILABILITY':'اسألينا عن التفاصيل والتوفر',
 'Add to my picks':'ضيفيها لاختياراتي',
 'Questions? Talk to us on Instagram ↗':'عندك سؤال؟ كلمينا على إنستجرام ↗',
 'Close dialog':'إغلاق النافذة',
 'Close search':'إغلاق البحث',
 'Close product details':'إغلاق تفاصيل المنتج',
 'Close enquiry list':'إغلاق الحقيبة',
 'Previous photo':'الصورة السابقة',
 'Next photo':'الصورة التالية',
 'View photo':'عرض الصورة',
 'Price confirmed with the studio':'السعر بيتأكد مع الاستوديو',
 'Details & pricing on request':'التفاصيل والسعر عند الطلب',
 'Your bag starts here.':'حقيبتك لسه مستنياكي',
 'Find a piece you love, then come back here.':'اختاري قطعة تحبيها وهتلاقيها هنا',
 'Remove':'إزالة',
 'Remove piece':'إزالة القطعة',
 'WELCOME TO THE STUDIO':'أهلاً بيكي في الاستوديو',
 'Welcome back.':'نورتي من تاني',
 'A little more yours.':'حاجة شبهك أكتر',
 'Sign in or create an account to continue. Your selected colors and quantities stay in your bag.':'سجلي الدخول أو اعملي حساب علشان تكملي وهنحتفظ بالألوان والكميات اللي اخترتيها',
 'Your own corner of the PatCh.BaGs studio — designed for a thoughtful shopping journey.':'مساحتك الخاصة في باتش باجز علشان كل تفاصيل تجربتك تبقى على ذوقك',
 'Secure sign-in is being configured. Your chosen items, colors and quantities remain saved on this device. Do not enter a password until the service is activated.':'خدمة تسجيل الدخول الآمن لسه تحت التجهيز اختياراتك محفوظة على الجهاز ومتدخليش كلمة مرور قبل تفعيل الخدمة',
 'Your name':'اسمك',
 'Email address':'البريد الإلكتروني',
 'Password':'كلمة المرور',
 'Sign in securely':'تسجيل الدخول بأمان',
 'Create my account':'أنشئي حسابي',
 'Passwords are never stored in this website’s code or local cart.':'كلمات المرور مش بتتخزن في كود الموقع أو سلة المشتريات',
 'YOUR STUDIO ACCOUNT':'حسابك في الاستوديو',
 'Hello again.':'أهلاً بيكي من تاني',
 'Sign out':'تسجيل الخروج',
 'Almost yours.':'قربت تبقى ليكي',
 '01 / Your picks':'01 / اختياراتك',
 '02 / Delivery':'02 / التوصيل',
 '03 / Payment':'03 / الدفع',
 'Prices, delivery and totals are quoted by the studio. This page does not charge you or place an order automatically.':'الاستوديو بيأكد الأسعار والتوصيل والإجمالي والصفحة مش بتخصم فلوس أو تثبت الطلب تلقائيًا',
 'Full name':'الاسم بالكامل',
 'Phone number':'رقم الموبايل',
 'City / delivery area':'المدينة أو منطقة التوصيل',
 'Delivery notes (optional)':'ملاحظات التوصيل (اختياري)',
 'Your preferred delivery address or customization request':'عنوان التوصيل أو تفاصيل التخصيص',
 'Your contact number':'رقم التواصل',
 'Your city':'مدينتك',
 'PAYMENT OPTION':'طريقة الدفع',
 'Request a payment link from the studio':'اطلبي رابط الدفع من الاستوديو',
 'No payment taken here. Copy your request and send it to the maker via Instagram.':'مفيش دفع هنا انسخي الطلب وابعتِيه للاستوديو على إنستجرام',
 'Secure online payment':'دفع إلكتروني آمن',
 'Coming soon — requires a connected merchant payment service.':'قريبًا بعد ربط بوابة الدفع',
 'Continue to hosted checkout after the server confirms prices.':'الانتقال للدفع الآمن بعد تأكيد الأسعار من السيرفر',
 'Copy order request →':'نسخ طلب الشراء ←',
 'This is an enquiry until the studio confirms prices and accepts your order. Never enter card details here.':'ده استفسار لحد ما الاستوديو يؤكد الأسعار ويقبل الطلب ومتكتبيش بيانات البطاقة هنا',
 'Message the studio':'راسلينا',
 'No matches yet. Try “bag”, “book” or “pouch”.':'ملقيناش نتائج جربي شنطة أو كتاب أو جراب',
 'The Signature Striped Tote':'شنطة توت المخططة المميزة',
 'The Ivory Sculpted Tote':'شنطة توت الأوف وايت',
 'The Blush Striped Tote':'شنطة توت الوردية المخططة',
 'The Taupe Crescent Crossbody':'كروس هلالية تاوب',
 'The Ivory Crescent Crossbody':'كروس هلالية أوف وايت',
 'The Ruby Crescent Crossbody':'كروس هلالية روبي',
 'The Round Crossbody':'شنطة كروس دائرية',
 'The Mustard Phone Pouch':'جراب موبايل مستردة',
 'The Natural Phone Pouch':'جراب موبايل طبيعي',
 'The Initial Zip Pouch':'جراب بسوستة وحرف مخصص',
 'The Chapter Book Sleeve':'جراب كتاب شابتر',
 'The Gingham Book Sleeve':'جراب كتاب كاروهات',
 'HANDMADE COTTON ROPE TOTE':'شنطة قطن منسوجة يدويًا',
 'PINK STRIPED HANDMADE TOTE':'شنطة وردية مخططة هاند ميد',
 'WOVEN CROSSBODY':'كروس منسوجة',
 'COTTON ROPE CROSSBODY':'كروس حبل قطن',
 'COTTON ROPE PHONE POUCH':'جراب موبايل قطن',
 'MONOGRAM ACCESSORY':'إكسسوار بحرف مخصص',
 'BOOK ACCESSORY':'إكسسوار كتب',
 'Signature piece':'قطعة مميزة',
 'In the spotlight':'في الأضواء',
 'Soft color story':'ألوان ناعمة',
 'Everyday texture':'تفاصيل يومية',
 'A soft neutral':'لون هادي',
 'A pop of color':'لمسة لون',
 'A timeless shape':'شكل كلاسيكي',
 'Hands-free essential':'قطعة عملية',
 'Naturally simple':'بساطة طبيعية',
 'Make it yours':'خصصيها',
 'For book lovers':'لعشاق الكتب',
 'The little joys':'فرحة صغيرة',
 'Charcoal Stripe':'مخطط فحمي',
 'Ivory':'أوف وايت',
 'Blush Stripe':'مخطط وردي',
 'Taupe':'تاوب',
 'Ruby':'أحمر روبي',
 'Mustard':'مستردة',
 'Natural':'طبيعي',
 'The card is saved on this device.':'القطعة محفوظة على جهازك',
 'I bought one of your bags and it’s super well made. Great job and keep going.':'اشتريت شنطة منكم وشغلها متقن جدًا برافو وربنا يوفقكم',
 "I bought one of your bags and it's super well made. Great job and keep going.":'اشتريت شنطة منكم وشغلها متقن جدًا برافو وربنا يوفقكم',
 'Thank you — amazing quality.':'شكرًا ليكم الجودة تحفة',
 'The bag is absolutely gorgeous. I was genuinely so happy with it.':'الشنطة جميلة جدًا وفرحت بيها من قلبي',
 'Lovely material, lovely finishing — and such a beautiful bright white.':'الخامة والتقفيل حلوين جدًا واللون الأبيض جميل',
 'A striped cotton-rope tote with a sculptural flap and distinctive clasp. Explore the weave, finishing and inner space through the photo gallery.':'شنطة توت مخططة بحبال قطن بتصميم مميز وقفل مختلف اتفرجي على تفاصيل النسيج والتقفيل والمساحة من الصور',
 'An ivory-toned woven tote with a sculptural front flap. The gallery shows close-up texture and different ways to wear or hold it.':'شنطة توت أوف وايت منسوجة بغطاء أمامي بتصميم بارز الصور بتوضح التفاصيل وطرق حملها',
 'A soft pink-and-ivory striped tote with textured cotton-rope detailing. See the decorative scarf and the handmade brand tag in close-up.':'شنطة مخططة وردي وأوف وايت بتفاصيل من حبال القطن وشال للزينة شوفي التفاصيل والعلامة اليدوية في الصور',
 'A compact woven crossbody in an earthy taupe shade, with a statement curved flap and detachable-style strap fittings shown in the photo.':'شنطة كروس صغيرة ومنسوجة بلون تاوب هادي بغطاء منحني وتفاصيل حمالة واضحة في الصور',
 'A light ivory crossbody with a curved woven flap and long matching strap, photographed from above.':'كروس أوف وايت فاتحة بغطاء منحني منسوج وحمالة طويلة متناسقة',
 'A vivid red woven crossbody with a sculptural flap, styled on a wooden display.':'كروس منسوجة باللون الأحمر الزاهي وغطاء بتصميم بارز',
 'A round cotton-rope crossbody featuring concentric woven lines and a compact shape.':'كروس دائرية من حبال القطن بتفاصيل نسج متداخلة وحجم عملي',
 'A small mustard-yellow woven pouch with a matching long cord strap and wooden-button closure.':'جراب صغير مستردة منسوج بحمالة طويلة وزرار خشبي',
 'A natural-toned woven pouch with a long matching cord strap and wooden button.':'جراب منسوج بلون طبيعي وحمالة طويلة وزرار خشبي',
 'Personalized initial pouches in different fabrics and colors. The photographs show examples with H and S initials; ask the studio about available letters.':'جرابات بتتخصص بالحروف بخامات وألوان مختلفة الصور فيها أمثلة بحرف H و S اسألينا عن الحروف المتاحة',
 'A soft book sleeve with the Just One More Chapter message, made for everyday reading moments.':'جراب كتاب ناعم بعبارة Just One More Chapter علشان لحظات القراءة الجميلة',
 'A red gingham book sleeve with the Just One More Chapter motif.':'جراب كتاب أحمر كاروهات بعبارة Just One More Chapter',
 'photo':'صورة',
 'photos':'صور'
};
Object.assign(translations,{
 'Skip to content':'انتقل إلى المحتوى',
 'Handcrafted with care in Alexandria, Egypt':'صناعة يدوية بعناية في الإسكندرية',
 'Made to feel personal':'تفاصيل صُممت لتناسب ذوقك',
 'HANDMADE STUDIO':'استوديو باتش باجز',
 'Shop collection':'تصفحي المجموعة',
 'Our story':'حكايتنا',
 'Personalize':'تصميمات حسب الطلب',
 'Contact':'تواصلي معنا',
 'Search products':'ابحثي عن منتج',
 'Open enquiry list':'افتحي حقيبة التسوق',
 'Open navigation':'افتحي القائمة',
 'Close navigation':'إغلاق القائمة',
 'My picks':'حقيبة التسوق',
 'Search the collection':'ابحثي في المجموعة',
 'PATCh.BaGs · HANDMADE IN ALEXANDRIA':'PatCh.BaGs · صناعة يدوية من الإسكندرية',
 'A little more':'تفاصيل صغيرة',
 'you.':'تشبهك.',
 'Small details. Beautifully handmade. A piece of everyday joy, made yours.':'قطع يدوية بتفاصيل مدروسة، تضيف لمسة خاصة لكل يوم.',
 'Explore the collection':'اكتشفي المجموعة',
 'Meet the maker':'تعرّفي على حكايتنا',
 'Made with intention':'صُنعت بعناية',
 'Handmade in Alexandria':'صناعة يدوية من الإسكندرية',
 'SCROLL TO EXPLORE':'تابعي التصفح',
 '01 / THE EVERYDAY EDIT':'01 / تفاصيل يومية',
 'HANDMADE / SINCE THE BEGINNING':'صناعة يدوية · من أول غرزة',
 'Made by hand':'صناعة يدوية',
 'Made with heart':'صُنعت بحب',
 'Made to be yours':'تفاصيل على ذوقك',
 'THE PATCH EDIT':'اختيارات باتش باجز',
 'Find your kind of':'اختاري ما يناسب ذوقك',
 'handmade.':'من القطع اليدوية.',
 '01 / CARRY':'01 / حقائب',
 '02 / KEEP':'02 / إكسسوارات',
 '03 / MAKE IT YOURS':'03 / لمستك الخاصة',
 'Bags':'الحقائب',
 'Little essentials':'إكسسوارات يومية',
 'Personalized':'تصميمات مخصصة',
 'Explore ↗':'اكتشفي ↗',
 'THE COLLECTION':'تشكيلة المنتجات',
 'A closer':'نظرة أقرب',
 'look.':'على التفاصيل.',
 'All pieces':'كل المنتجات',
 'Handmade bags':'الحقائب اليدوية',
 'Accessories':'الإكسسوارات',
 'Seen something you love?':'لفتت نظرك قطعة؟',
 'Ask us about it ↗':'اسألي عن تفاصيلها ↗',
 'IN THE DETAILS':'جمال التفاصيل',
 'The textures':'خامات وتفاصيل',
 'we love.':'نحبها.',
 'The craft':'إتقان الصنعة',
 'The details':'أدق التفاصيل',
 'The little joys':'تفاصيل تُسعدك',
 'THE PHOTO DIARY / PATCH.BAGS':'حكاية بالصور / PATCH.BAGS',
 'Worn with':'قطع صُنعت',
 'love.':'بحب.',
 'Real pieces. Real moments. Explore the details and tap the + to see a piece up close.':'كل صورة تحكي تفصيلة. اضغطي على علامة + لاكتشاف القطعة عن قرب.',
 '01 / EVERYDAY CARRY':'01 / أناقة كل يوم',
 '02 / A TOUCH OF BLUSH':'02 / لمسة وردية',
 '03 / MADE BY HAND':'03 / صناعة يدوية',
 '04 / PERSONAL TOUCH':'04 / لمستك الخاصة',
 'TAP + TO EXPLORE EACH PIECE':'اضغطي على + لاكتشاف كل قطعة',
 'Previous lookbook image':'الصورة السابقة',
 'Next lookbook image':'الصورة التالية',
 'View the ivory woven tote':'عرض الحقيبة العاجية المنسوجة',
 'View the blush striped tote':'عرض الحقيبة المخططة بالوردي',
 'View the signature striped tote':'عرض الحقيبة المخططة المميزة',
 'View the personalized initial pouch':'عرض الجراب المخصص بالحرف',
 'Ivory sculpted tote':'حقيبة توت عاجية بتصميم مميز',
 'Blush striped tote':'حقيبة مخططة بالوردي',
 'Signature striped tote':'حقيبة باتش باجز المميزة',
 'Initial zip pouch':'جراب بسوستة وحرف مخصص',
 'KIND WORDS / REAL CUSTOMER FEEDBACK':'آراء حقيقية من عميلاتنا',
 'Loved by':'حكايات من',
 'Notes from our customers, shared with love. Some quotes are translated from Arabic.':'تجارب حقيقية من عميلاتنا، نشاركها بكل تقدير.',
 'CUSTOMER FEEDBACK · ORIGINAL ENGLISH':'رأي عميلة · النص الأصلي بالإنجليزية',
 'CUSTOMER FEEDBACK · TRANSLATED FROM ARABIC':'رأي عميلة · مترجم من العربية',
 'HANDMADE / ALEXANDRIA':'صناعة يدوية / الإسكندرية',
 'Previous review':'الرأي السابق',
 'Next review':'الرأي التالي',
 'Pause automatic reviews':'إيقاف التنقل التلقائي',
 'JUST FOR YOU ✳':'تفصيلة على ذوقك ✳',
 'Make it':'اختاري تفصيلة',
 'personal.':'تشبهك.',
 'Ask about custom pieces':'اسألي عن تنفيذ قطعة خاصة',
 'made for':'صُنعت',
 'you':'لكِ',
 'FOLLOW THE LITTLE THINGS':'تابعينا واكتشفي التفاصيل',
 'A little':'مساحة من',
 'inspiration.':'الإلهام.',
 'THE STUDIO / ALEXANDRIA':'الاستوديو / الإسكندرية',
 'Made slowly.':'صُنعت على مهل.',
 'Loved endlessly.':'لتدوم طويلًا.',
 'At PatCh.BaGs, we believe the everyday deserves a little beauty. Thoughtfully handmade bags, soft textures and personal pieces — crafted with care, one detail at a time.':'في باتش باجز نؤمن أن جمال القطعة يبدأ من تفاصيلها. لذلك نصنع حقائب وإكسسوارات يدوية بخامات مختارة وعناية تظهر في كل غرزة.',
 'Our story continues on Instagram':'تابعي جديدنا على إنستجرام',
 'THE BEAUTY OF SLOW-MADE THINGS':'جمال التفاصيل المصنوعة على مهل',
 'SLOWLY MADE · FOREVER LOVED':'صناعة يدوية بعناية · تفاصيل تدوم',
 'Thoughtfully handmade bags, personal pieces and little everyday treasures.':'حقائب وإكسسوارات وقطع مميزة تُصنع يدويًا بعناية.',
 'Made with care in Alexandria, Egypt.':'صُنعت بعناية في الإسكندرية، مصر.',
 'HAVE SOMETHING IN MIND?':'لديكِ فكرة في بالك؟',
 "Let's make it":"لنحوّلها إلى",
 'yours.':'قطعة تخصك.',
 'Talk to the studio':'تواصلي مع الاستوديو',
 'EXPLORE':'تصفحي',
 'Personalized pieces':'تصميمات حسب الطلب',
 'HERE TO HELP':'نحن هنا لمساعدتك',
 'Ask a question':'أرسلي استفسارك',
 'Customer notes':'آراء العملاء',
 'Browse handmade pieces':'تصفحي القطع اليدوية',
 'YOUR ACCOUNT':'حسابك',
 'Sign in':'تسجيل الدخول',
 'Create account':'إنشاء حساب',
 'STAY CONNECTED':'تابعي أخبارنا',
 'Find the little moments behind each handmade piece.':'اكتشفي التفاصيل الصغيرة وراء كل قطعة.',
 'HANDMADE IN ALEXANDRIA':'صناعة يدوية من الإسكندرية',
 'Back to top ↑':'العودة إلى الأعلى ↑',
 'Made with ♡':'صُنع بحب ♡',
 'YOUR FAVORITES':'اختياراتك',
 'Your bag':'حقيبتك',
 'THE PATCH BAG / CHECKOUT':'حقيبتك / إتمام الطلب',
 'THE PATCH EDIT':'اختيارات باتش باجز',
 'Your selected pieces':'القطع التي اخترتها',
 'Prices and delivery are confirmed with the studio before any payment is requested.':'يؤكد الاستوديو السعر وتكلفة التوصيل قبل إتمام أي عملية دفع.',
 'Prices and availability are confirmed by the studio. This is an enquiry list, not an online checkout.':'يؤكد الاستوديو الأسعار والتوافر قبل الطلب. هذه قائمة استفسار وليست عملية شراء إلكترونية.',
 'Continue to checkout':'متابعة لإتمام الطلب',
 'Copy bag enquiry ↗':'نسخ تفاصيل الطلب ↗',
 'Copy my enquiry':'نسخ استفساري',
 'Then message us on Instagram ↗':'ثم أرسليه إلينا عبر إنستجرام ↗',
 'SEARCH THE STUDIO':'ابحثي في المتجر',
 'Totes, book sleeves, custom...':'حقائب، حافظات كتب، تصميمات خاصة...',
 'Product details':'تفاصيل المنتج',
 'COLOR':'اللون',
 'Photos show the selected color. Availability is confirmed by the studio.':'تعرض الصور اللون المختار، ويؤكد الاستوديو مدى توافره.',
 'HANDCRAFTED':'صناعة يدوية',
 'ASK FOR DETAILS & AVAILABILITY':'استفسري عن التفاصيل والتوافر',
 'Add to my picks':'أضيفي إلى حقيبتك',
 'Questions? Talk to us on Instagram ↗':'لديكِ سؤال؟ تواصلي معنا عبر إنستجرام ↗',
 'Close dialog':'إغلاق النافذة',
 'Close search':'إغلاق البحث',
 'Close product details':'إغلاق تفاصيل المنتج',
 'Close enquiry list':'إغلاق حقيبة التسوق',
 'Previous photo':'الصورة السابقة',
 'Next photo':'الصورة التالية',
 'View photo':'عرض الصورة',
 'Price confirmed with the studio':'السعر يؤكده الاستوديو',
 'Details & pricing on request':'التفاصيل والسعر عند الاستفسار',
 'Your bag starts here.':'ابدئي باختيار قطعك المفضلة.',
 'Find a piece you love, then come back here.':'تصفحي المجموعة وأضيفي القطع التي أعجبتك إلى حقيبتك.',
 'Remove':'إزالة',
 'Remove piece':'إزالة القطعة',
 'WELCOME TO THE STUDIO':'مرحبًا بكِ في باتش باجز',
 'Welcome back.':'سعداء بعودتكِ.',
 'A little more yours.':'تجربة تسوق أقرب إلى ذوقك.',
 'Sign in or create an account to continue. Your selected colors and quantities stay in your bag.':'سجّلي الدخول أو أنشئي حسابًا للمتابعة، وسنحتفظ بالقطع والألوان التي اخترتها في حقيبتك.',
 'Your own corner of the PatCh.BaGs studio — designed for a thoughtful shopping journey.':'مساحتك الخاصة لمتابعة اختياراتك وطلباتك من باتش باجز.',
 'Secure sign-in is being configured. Your chosen items, colors and quantities remain saved on this device. Do not enter a password until the service is activated.':'خدمة تسجيل الدخول الآمن قيد الإعداد. ستظل اختياراتك محفوظة على هذا الجهاز. لا تدخلي كلمة مرور قبل تفعيل الخدمة.',
 'Your name':'الاسم',
 'Email address':'البريد الإلكتروني',
 'Password':'كلمة المرور',
 'Sign in securely':'تسجيل الدخول بأمان',
 'Create my account':'إنشاء حسابي',
 'Passwords are never stored in this website’s code or local cart.':'لا تُحفظ كلمات المرور داخل كود الموقع أو حقيبة التسوق المحلية.',
 'YOUR STUDIO ACCOUNT':'حسابك في باتش باجز',
 'Hello again.':'مرحبًا بعودتكِ.',
 'Sign out':'تسجيل الخروج',
 'Almost yours.':'بقيت خطوة واحدة.',
 '01 / Your picks':'01 / اختياراتك',
 '02 / Delivery':'02 / التوصيل',
 '03 / Payment':'03 / الدفع',
 'Prices, delivery and totals are quoted by the studio. This page does not charge you or place an order automatically.':'يؤكد الاستوديو الأسعار والتوصيل والإجمالي. لن يتم تحصيل أي مبلغ أو تأكيد الطلب تلقائيًا من هذه الصفحة.',
 'Full name':'الاسم بالكامل',
 'Phone number':'رقم الهاتف',
 'City / delivery area':'المدينة / منطقة التوصيل',
 'Delivery notes (optional)':'ملاحظات التوصيل (اختياري)',
 'Your preferred delivery address or customization request':'عنوان التوصيل أو تفاصيل التخصيص',
 'Your contact number':'رقم الهاتف للتواصل',
 'Your city':'المدينة',
 'PAYMENT OPTION':'طريقة الدفع',
 'Request a payment link from the studio':'اطلبي رابط دفع من الاستوديو',
 'No payment taken here. Copy your request and send it to the maker via Instagram.':'لا يتم تحصيل أي مدفوعات هنا. انسخي طلبك وأرسليه إلى الاستوديو عبر إنستجرام.',
 'Secure online payment':'الدفع الإلكتروني الآمن',
 'Coming soon — requires a connected merchant payment service.':'قريبًا بعد ربط بوابة الدفع وتفعيلها.',
 'Continue to hosted checkout after the server confirms prices.':'الانتقال إلى صفحة الدفع الآمنة بعد تأكيد الأسعار من الخادم.',
 'Copy order request →':'نسخ طلب الشراء ←',
 'This is an enquiry until the studio confirms prices and accepts your order. Never enter card details here.':'هذا الطلب استفسار مبدئي حتى يؤكد الاستوديو الأسعار ويوافق عليه. لا تدخلي بيانات بطاقتك هنا.',
 'Message the studio':'تواصلي مع الاستوديو',
 'No matches yet. Try “bag”, “book” or “pouch”.':'لم نعثر على نتائج. جرّبي البحث عن حقيبة أو حافظة كتب أو جراب.',
 'The Signature Striped Tote':'حقيبة توت مخططة بتوقيع باتش',
 'The Ivory Sculpted Tote':'حقيبة توت عاجية بتصميم مميز',
 'The Blush Striped Tote':'حقيبة توت مخططة بالوردي',
 'The Taupe Crescent Crossbody':'حقيبة كروس هلالية بلون تاوب',
 'The Ivory Crescent Crossbody':'حقيبة كروس هلالية باللون العاجي',
 'The Ruby Crescent Crossbody':'حقيبة كروس هلالية باللون الأحمر الياقوتي',
 'The Round Crossbody':'حقيبة كروس دائرية',
 'The Mustard Phone Pouch':'جراب هاتف باللون الخردلي',
 'The Natural Phone Pouch':'جراب هاتف باللون الطبيعي',
 'The Initial Zip Pouch':'جراب بسوستة وحرف مخصص',
 'The Chapter Book Sleeve':'حافظة كتاب Chapter',
 'The Gingham Book Sleeve':'حافظة كتاب بنقشة المربعات',
 'HANDMADE COTTON ROPE TOTE':'حقيبة توت من حبال القطن',
 'PINK STRIPED HANDMADE TOTE':'حقيبة يدوية مخططة بالوردي',
 'WOVEN CROSSBODY':'حقيبة كروس منسوجة',
 'COTTON ROPE CROSSBODY':'حقيبة كروس من حبال القطن',
 'COTTON ROPE PHONE POUCH':'جراب هاتف من حبال القطن',
 'MONOGRAM ACCESSORY':'إكسسوار بحرف مخصص',
 'BOOK ACCESSORY':'إكسسوار للكتب',
 'Signature piece':'قطعة مميزة',
 'In the spotlight':'قطعة مختارة',
 'Soft color story':'ألوان هادئة',
 'Everyday texture':'تفاصيل تناسب كل يوم',
 'A soft neutral':'درجة هادئة',
 'A pop of color':'لمسة من اللون',
 'A timeless shape':'تصميم لا يتكرر',
 'Hands-free essential':'عملية وسهلة الحمل',
 'Naturally simple':'بساطة بطابع طبيعي',
 'Make it yours':'أضيفي لمستك',
 'For book lovers':'لعشاق القراءة',
 'The little joys':'تفاصيل مبهجة',
 'Charcoal Stripe':'مخطط بالفحمي',
 'Ivory':'عاجي',
 'Blush Stripe':'مخطط بالوردي',
 'Taupe':'بني رمادي',
 'Ruby':'أحمر ياقوتي',
 'Mustard':'أصفر خردلي',
 'Natural':'لون طبيعي',
 'The card is saved on this device.':'تم حفظ القطعة على هذا الجهاز.',
 'Added to your enquiry list ♡':'أُضيفت القطعة إلى حقيبتك ♡',
 'Already in your picks ♡':'القطعة موجودة بالفعل في حقيبتك ♡',
 'Removed from your picks':'تمت إزالة القطعة من حقيبتك',
 'Choose a piece from the collection first':'اختاري قطعة من المجموعة أولًا',
 'Enquiry copied — paste it into your Instagram message':'تم نسخ تفاصيل الطلب — أرسليها عبر إنستجرام',
 'Hello PatCh.BaGs! ♡':'مرحبًا باتش باجز ♡',
 'photo':'صورة',
 'photos':'صور',
 'View the ivory woven tote':'عرض الحقيبة المنسوجة باللون العاجي',
 'An ivory handmade rope tote photographed with the model':'حقيبة منسوجة باللون العاجي في صورة مع العارضة',
 'Handmade striped cotton cord bag, designed and made in Alexandria':'حقيبة من حبال القطن، صُممت وصُنعت يدويًا في الإسكندرية',
 'Model carrying the ivory woven tote with a black denim jacket':'عارضة تحمل حقيبة منسوجة باللون العاجي مع سترة جينز سوداء',
 'Blush striped tote photographed with a decorative scarf':'حقيبة مخططة بالوردي مع وشاح مزخرف',
 'The PatCh.BaGs handmade signature label close-up':'لقطة قريبة لعلامة باتش باجز المصنوعة يدويًا',
 'Cream handmade personal initial letter pouch':'جراب كريمي مخصص بحرف أول',
 'Model carrying a handmade round cotton cord crossbody bag':'عارضة تحمل حقيبة كروس دائرية من حبال القطن',
 'Handmade striped fabric pouch with large personalized letter S':'جراب قماشي مخطط بحرف S مخصص',
 'Explore the 3D product model':'استكشفي مجسم المنتج ثلاثي الأبعاد',
 'Open original 3D model ↗':'فتح النموذج الأصلي ثلاثي الأبعاد ↗',
 'Interactive 3D product model':'مجسم تفاعلي للمنتج ثلاثي الأبعاد',
 '3D tag unavailable on this device':'العنصر ثلاثي الأبعاد غير متاح على هذا الجهاز',
 'PatCh.BaGs back to home':'العودة إلى الصفحة الرئيسية لـ PatCh.BaGs',
 'Chat with PatCh.BaGs on WhatsApp':'تواصلي مع PatCh.BaGs عبر واتساب',
 'Message us on WhatsApp':'راسلينا على واتساب',
 'Choose language':'اختاري اللغة',
 'Explore the studio':'اكتشفي الاستوديو',
 'Bags, accessories and custom-made pieces':'حقائب وإكسسوارات وقطع تُنفذ حسب الطلب',
 'Your selected pieces':'القطع التي اخترتها',
 'Select a color for':'اختاري لونًا لـ'
});
let locale='en';
try{locale=localStorage.getItem('patchbags_locale_v1')==='ar'?'ar':'en'}catch(_){}
const originals=new WeakMap();
const originalAttrs=new WeakMap();
let pending=false;
function translated(english){
 if(Object.prototype.hasOwnProperty.call(translations,english))return translations[english];
 if(english.startsWith('View ')&&english.endsWith(' color'))
  return 'عرض اللون '+(translations[english.slice(5,-6)]||english.slice(5,-6));
 if(english.startsWith('Add ')&&english.endsWith(' to your picks'))
  return 'إضافة '+(translations[english.slice(4,-14)]||english.slice(4,-14))+' لاختياراتك';
 if(english.startsWith('View ')&&english.includes(' photo'))
  return 'عرض صور '+english.slice(5);
 if(english.startsWith('PIECE '))return 'قطعة '+english.slice(6);
 if(english.startsWith('Signed in as '))return 'تم تسجيل الدخول بحساب '+english.slice(13);
 return english;
}
function localizeText(node){
 const parent=node.parentElement;
 if(!parent||parent.closest('script,style,svg,noscript,textarea,code,[data-patch-translate="off"]'))return;
 if(!originals.has(node))originals.set(node,node.nodeValue);
 const base=originals.get(node),str=base.trim();
 if(!str)return;
 const output=locale==='ar'?translated(str):str;
 if(output===str&&locale==='ar')return;
 const result=base.replace(str,output);
 if(node.nodeValue!==result)node.nodeValue=result;
}
function localizeAttrs(el){
 if(!el||el.nodeType!==1)return;
 let original=originalAttrs.get(el);
 if(!original){original={};originalAttrs.set(el,original)}
 for(const key of ['aria-label','placeholder','title','alt']){
  if(!el.hasAttribute(key))continue;
  if(!(key in original))original[key]=el.getAttribute(key);
  const en=original[key],v=locale==='ar'?translated(en):en;
  if(el.getAttribute(key)!==v)el.setAttribute(key,v);
 }
}
function localizeTree(root){
 if(!root)return;
 if(root.nodeType===1)localizeAttrs(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(node.nodeType===3)localizeText(node);
  else localizeAttrs(node);
 }
}
function setLocale(next,save=true){
 locale=next==='ar'?'ar':'en';
 document.documentElement.lang=locale;
 document.documentElement.dir=locale==='ar'?'rtl':'ltr';
 document.documentElement.dataset.locale=locale;
 document.title=locale==='ar'?'باتش باجز | حقائب وإكسسوارات يدوية من الإسكندرية':'PatCh.BaGs — Handmade with intention';
 const description=document.querySelector('meta[name="description"]');
 if(description)description.content=locale==='ar'?'حقائب وإكسسوارات وقطع مخصصة تُصنع يدويًا بعناية في الإسكندرية. اكتشفي مجموعة باتش باجز.':'PatCh.BaGs — thoughtfully handmade bags and accessories from Alexandria, Egypt. Discover timeless cotton cord bags, book sleeves and personalized everyday essentials.';
 const ogDescription=document.querySelector('meta[property="og:description"]');
 if(ogDescription)ogDescription.content=locale==='ar'?'حقائب وإكسسوارات يدوية بتفاصيل مدروسة، صُنعت بعناية في الإسكندرية.':'Thoughtful handmade bags and accessories, crafted in Alexandria, Egypt.';
 const ogTitle=document.querySelector('meta[property="og:title"]');
 if(ogTitle)ogTitle.content=locale==='ar'?'باتش باجز | تفاصيل صُنعت بحب':'PatCh.BaGs | Made slowly. Loved endlessly.';
 if(save)try{localStorage.setItem('patchbags_locale_v1',locale)}catch(_){}
 document.querySelectorAll('[data-patch-lang]').forEach(btn=>{
  const active=btn.dataset.patchLang===locale;
  btn.setAttribute('aria-pressed',String(active));
  btn.classList.toggle('active',active);
 });
 localizeTree(document.body);
 document.dispatchEvent(new CustomEvent('patch:language-changed',{detail:{language:locale}}));
}
function scheduleLocalization(){
 if(pending)return;
 pending=true;
 requestAnimationFrame(()=>{pending=false;localizeTree(document.body)});
}
function initLocalization(){
 document.querySelectorAll('[data-patch-lang]').forEach(btn=>{
  btn.addEventListener('click',()=>{const compact=window.matchMedia('(max-width:400px)').matches&&btn.closest('.patch-lang-toggle-header');setLocale(compact?(locale==='ar'?'en':'ar'):btn.dataset.patchLang)});
 });
 setLocale(locale,false);
 const obs=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.addedNodes.length))scheduleLocalization();
 });
 const targets=['productGrid','bagItems','productModal','searchModal','patchCommerceLayer','patchWords'];
 targets.forEach(id=>{const node=document.getElementById(id);if(node)obs.observe(node,{childList:true,subtree:true})});
 obs.observe(document.body,{childList:true});
 const late=new MutationObserver(ms=>{
  for(const m of ms)for(const node of m.addedNodes)if(node.nodeType===1&&node.id==='patchCommerceLayer'){
   obs.observe(node,{childList:true,subtree:true});
   scheduleLocalization();
  }
 });
 late.observe(document.body,{childList:true});
 window.PATCH_LANGUAGE={get:()=>locale,set:setLocale,translate:translated};
}
function initHero(){
 const hero=document.querySelector('.editorial-hero');
 if(!hero||!window.matchMedia('(hover: hover) and (pointer: fine)').matches||
 window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let next=null;
 hero.addEventListener('pointermove',event=>{
  const rect=hero.getBoundingClientRect();
  const x=((event.clientX-rect.left)/rect.width*100).toFixed(1)+'%';
  const y=((event.clientY-rect.top)/rect.height*100).toFixed(1)+'%';
  if(next!==null)cancelAnimationFrame(next);
  next=requestAnimationFrame(()=>{
   hero.style.setProperty('--pointer-x',x);
   hero.style.setProperty('--pointer-y',y);
   next=null;
  });
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{
  hero.style.setProperty('--pointer-x','24%');
  hero.style.setProperty('--pointer-y','44%');
 },{passive:true});
}
function initProgress(){
 const line=document.querySelector('.patch-scroll-progress>span');if(!line)return;
 let scheduled=false;
 function draw(){
  scheduled=false;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const progress=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
  line.style.transform='scaleX('+progress+')';
 }
 function onScroll(){if(!scheduled){scheduled=true;requestAnimationFrame(draw)}}
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',onScroll,{passive:true});
 draw();
}
function initLookbook(){
 const grid=document.getElementById('patchPremiumLookbook');if(!grid)return;
 grid.addEventListener('click',event=>{
  const hotspot=event.target.closest('[data-lookbook-product]');
  if(!hotspot)return;
  const id=hotspot.dataset.lookbookProduct;
  if(typeof window.showProduct==='function'){
   window.showProduct(id);return;
  }
  const card=document.querySelector('#productGrid [data-detail="'+id+'"]');
  if(card)card.click();
  else document.getElementById('collection')?.scrollIntoView({behavior:'smooth'});
 });
 document.querySelectorAll('[data-lookbook-direction]').forEach(button=>{
  button.addEventListener('click',()=>{
   const forward=button.dataset.lookbookDirection==='next'?1:-1;
   const rtl=document.documentElement.dir==='rtl'?-1:1;
   grid.scrollBy({left:forward*rtl*(grid.clientWidth*.85),behavior:'smooth'});
  });
 });
}
function init(){
 initLocalization();
 initHero();
 initProgress();
 initLookbook();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
