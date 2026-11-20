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
// Sanctuary harvest trees are already painted into the terrain. Reuse their
// exact pixels for foreground depth instead of introducing a second art style.
export const templeTrees = [
  { id: 'west-grove', x: 45, y: 543, width: 160, height: 126, footX: 127, footY: 658,
    path: 'M52 584 L65 566 L82 557 L98 552 L109 544 L123 556 L142 548 L156 561 L176 566 L190 586 L196 607 L181 625 L151 631 L138 644 L140 654 L151 662 L130 660 L121 666 L110 662 L119 648 L115 632 L91 634 L69 624 L52 609 Z' },
  { id: 'garden-olive', x: 333, y: 544, width: 160, height: 140, footX: 418, footY: 673,
    path: 'M344 586 L355 565 L375 559 L390 546 L409 557 L427 551 L445 568 L463 566 L481 587 L490 612 L476 630 L447 636 L429 649 L427 663 L440 676 L419 674 L408 682 L398 677 L408 662 L403 644 L380 638 L357 630 L339 611 Z' },
  { id: 'southwest-grove', x: 439, y: 700, width: 150, height: 129, footX: 516, footY: 817,
    path: 'M446 744 L462 724 L479 715 L491 702 L508 713 L526 707 L545 720 L565 725 L581 745 L585 766 L568 784 L541 789 L526 801 L525 812 L538 822 L516 820 L506 827 L496 821 L505 807 L500 790 L476 786 L453 774 L441 757 Z' },
  { id: 'lake-grove', x: 784, y: 793, width: 155, height: 140, footX: 866, footY: 922,
    path: 'M796 840 L808 821 L828 811 L841 796 L857 808 L877 801 L892 818 L911 820 L929 838 L937 860 L924 882 L898 888 L879 901 L876 915 L889 925 L866 924 L856 931 L846 926 L857 910 L851 892 L827 888 L806 877 L791 859 Z' },
] as const;
const imageScale = 1334 / 1024;
export const forestImagePoint = (x: number, y: number) => ({
  x: x * imageScale - (1536 * imageScale - 2000) / 2,
  y: y * imageScale,
});
export const forestImageScale = imageScale;
