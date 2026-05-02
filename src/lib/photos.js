// Real-photo URLs from Unsplash. Swap any time with your own assets in /public.
const u = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const photos = {
  hero:        u("1503676260728-1c00da094a0b", 1800),
  classroom:   u("1497486751825-1233686d5d80"),
  community:   u("1488521787991-ed7bbaae773c"),
  school:      u("1542884748-2b87b36c6b90"),
  child:       u("1571260899304-425eee4c7efc"),
  market:      u("1535489040055-02ea71d6ea16"),
  health:      u("1581952976147-5a2d15560349"),
  family:      u("1560250097-0b93528c311a")
};
