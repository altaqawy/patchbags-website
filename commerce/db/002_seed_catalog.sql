-- Preserve product identifiers already used by the public storefront.
-- Zero price & inactive stock prevent accidental charges until owner review.
INSERT INTO products(id,title,description,image_url) VALUES
('PB-01','The Signature Striped Tote','Striped cotton-rope tote','https://altaqawy.github.io/patchbags-website/assets/new/striped-tote-studio-front.webp'),
('PB-02','The Ivory Sculpted Tote','Ivory woven tote','https://altaqawy.github.io/patchbags-website/assets/new/ivory-tote-portrait-front.webp'),
('PB-03','The Blush Striped Tote','Blush handmade tote','https://altaqawy.github.io/patchbags-website/assets/blush-cotton-tote.webp'),
('PB-04','The Taupe Crescent Crossbody','Woven crossbody','https://altaqawy.github.io/patchbags-website/assets/new/crescent-crossbody-taupe.webp'),
('PB-05','The Ivory Crescent Crossbody','Woven crossbody','https://altaqawy.github.io/patchbags-website/assets/new/crescent-crossbody-ivory.webp'),
('PB-06','The Ruby Crescent Crossbody','Ruby crossbody','https://altaqawy.github.io/patchbags-website/assets/new/round-crossbody-red.webp'),
('PB-07','The Round Crossbody','Round woven crossbody','https://altaqawy.github.io/patchbags-website/assets/round-crossbody-sun.webp'),
('PB-08','The Mustard Phone Pouch','Phone pouch','https://altaqawy.github.io/patchbags-website/assets/new/phone-pouch-mustard.webp'),
('PB-09','The Natural Phone Pouch','Phone pouch','https://altaqawy.github.io/patchbags-website/assets/new/phone-pouch-natural.webp'),
('PB-10','The Initial Zip Pouch','Personalized pouch','https://altaqawy.github.io/patchbags-website/assets/new/monogram-black-h.webp'),
('PB-11','The Chapter Book Sleeve','Book sleeve','https://altaqawy.github.io/patchbags-website/assets/new/book-sleeve-grey.webp'),
('PB-12','The Gingham Book Sleeve','Gingham sleeve','https://altaqawy.github.io/patchbags-website/assets/book-sleeve-gingham.webp')
ON CONFLICT(id) DO NOTHING;
