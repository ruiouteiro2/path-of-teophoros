import test from 'node:test';
import assert from 'node:assert/strict';
import { frameWorld } from '../src/camera.ts';

const outdoor = { width: 2000, height: 1334 };
test('desktop shows the whole map and centers unused space instead of cropping', () => {
  const viewport = { width: 1920, height: 1080 };
  for (const focus of [{ x: 0, y: 0 }, { x: 1000, y: 667 }, { x: 2000, y: 1334 }]) {
    const f = frameWorld(viewport, outdoor, focus);
    assert(f.width <= viewport.width && f.height <= viewport.height);
    assert(Math.abs(f.left * 2 + f.width - viewport.width) < 1e-8);
    assert(Math.abs(f.top * 2 + f.height - viewport.height) < 1e-8);
  }
});

test('phone follow camera keeps map edges covered and characters readable', () => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    for (const focus of [{ x: 0, y: 0 }, { x: 1000, y: 667 }, { x: 2000, y: 1334 }]) {
      const f = frameWorld(viewport, outdoor, focus);
      assert(76 * f.scale >= 49);
      assert(f.left <= 0 && f.top <= 0);
      assert(f.left + f.width >= viewport.width && f.top + f.height >= viewport.height);
      const x = f.left + focus.x * f.scale, y = f.top + focus.y * f.scale;
      assert(x >= 0 && x <= viewport.width && y >= 0 && y <= viewport.height);
    }
  }
});

test('fitted cabin stays centered and story focus moves within the phone frame', () => {
  const cabin = frameWorld({ width: 1100, height: 760 }, { width: 900, height: 600 }, { x: 450, y: 300 });
  assert.equal(cabin.left, 100);
  assert.equal(cabin.top, 80);
  const viewport = { width: 568, height: 320 }, focus = { x: 1000, y: 500 };
  const story = frameWorld(viewport, outdoor, focus, 0.29);
  assert(Math.abs(story.top + focus.y * story.scale - viewport.height * 0.29) < 1e-8);
});
