// Foreground silhouettes authored against the unchanged 1536x1024 forest image.
// The full terrain remains the ground layer; these masks restore depth at paths.
export const forestTrees = [
  { id: 'west-olive', x: 212, y: 402, width: 148, height: 148, footX: 288, footY: 540,
    path: 'M226 437 L242 420 L252 414 L267 421 L277 406 L289 421 L306 414 L317 429 L334 430 L345 447 L350 466 L340 484 L323 495 L306 494 L300 510 L299 526 L308 539 L293 539 L286 544 L274 539 L282 525 L282 508 L270 492 L252 491 L235 479 L222 463 Z' },
  { id: 'southwest-olive', x: 236, y: 618, width: 164, height: 166, footX: 320, footY: 772,
    path: 'M250 654 L270 640 L281 625 L296 635 L310 622 L323 636 L338 628 L353 641 L371 646 L382 662 L392 685 L383 708 L363 725 L340 728 L328 746 L330 760 L342 773 L323 771 L313 778 L301 774 L312 759 L310 741 L291 724 L268 720 L250 706 L241 681 Z' },
  { id: 'trail-pine', x: 373, y: 714, width: 88, height: 124, footX: 418, footY: 829,
    path: 'M418 719 L430 744 L438 759 L431 757 L447 780 L440 780 L456 801 L436 806 L425 804 L424 820 L431 830 L416 832 L406 828 L413 819 L411 805 L391 810 L377 802 L394 778 L386 780 L402 756 L395 759 L409 738 Z' },
] as const;
const imageScale = 1334 / 1024;
export const forestImagePoint = (x: number, y: number) => ({
  x: x * imageScale - (1536 * imageScale - 2000) / 2,
  y: y * imageScale,
});
export const forestImageScale = imageScale;
