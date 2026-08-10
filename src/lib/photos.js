// Photography for the platform: African / West African children, schools, families,
// markets and community health. All Pexels — free for commercial use, hotlinkable,
// no attribution required. Swap any time with your own assets in /public.
//
// slot        source photo                                                        location
// hero        "Happy Children During School Brake Time" · Obibini Kobby           Accra, Ghana
// classroom   "Children at School" · Armstrong Opulency                           Ishiagu, Nigeria
// community   "African Women and Kids Sitting under a Tree" · Xavier Messina      Africa
// school      "Children Gathering in Rural African Village Schoolyard"            Africa
// child       "Portrait of Schoolgirl" · ZEL Photography                          Ghana
// market      "Bustling Market Scene in Accra, Ghana" · Zeal Creative Studios     Accra, Ghana
// health      "Healthcare Outreach in Kaduna, Nigeria" · mk_photoz                Kaduna, Nigeria
// family      "African Family in Traditional Clothing Portrait" · Darkshade       Africa

const p = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const photos = {
  hero:        p(9424263, 1800),
  classroom:   p(12448839),
  community:   p(12429854),
  school:      p(35250413),
  child:       p(20191067),
  market:      p(36392318),
  health:      p(33132346),
  family:      p(33693372)
};
