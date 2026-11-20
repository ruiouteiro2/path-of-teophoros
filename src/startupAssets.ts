// Core scene art is cached before the title opens. Audio remains lazy-loaded.
import { terrainAssets } from './terrainAssets';

export const startupAssets = [
  require('../assets/world/olympus-title.png'),
  ...Object.values(terrainAssets),
  require('../assets/world/hero/short-chiton.png'),
  require('../assets/world/hero/short-cloak.png'),
  require('../assets/world/hero/tied-chiton.png'),
  require('../assets/world/hero/tied-cloak.png'),
  require('../assets/world/hero/recovery.png'),
  require('../assets/world/npcs/priest-portrait.png'),
  require('../assets/world/npcs/priest-walk-v2.png'),
  require('../assets/world/npcs/keeper-walk.png'),
  require('../assets/world/npcs/keeper-portrait.png'),
  require('../assets/world/pets/boxer.png'),
  require('../assets/world/pets/small-dog.png'),
  require('../assets/world/pets/cat.png'),
  require('../assets/world/pets/fox.png'),
  require('../assets/world/pets/owl-v2.png'),
];
