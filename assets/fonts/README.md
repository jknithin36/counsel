# Fonts for generated images

Static TTF copies of the site fonts, used only by the Open Graph images in
`lib/og-image.tsx` (`next/og` can't read the web fonts loaded by
`next/font`). Both are licensed under the SIL Open Font License 1.1; see the
OFL files in this folder.

- `Newsreader-Regular.ttf`: Newsreader, 72pt optical size, regular weight
- `Manrope-Medium.ttf`: Manrope, medium weight

If you change the site fonts in `app/layout.tsx`, replace these files too.
