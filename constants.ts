import { Theme, DiscussionCategory } from './types';

export const THEMES = [
  { id: Theme.Dark, name: 'Dark' },
  { id: Theme.Light, name: 'Light' },
];

export const CATEGORIES = [
  'Transportasi',
  'Pembayaran',
  'Fasilitas',
  'Layanan',
  'Kesehatan',
  'Darurat',
  'Hiburan',
  'Tips',
  'Lainnya',
];

export const CITIES = [
  'Jakarta',
  'Bogor',
  'Depok',
  'Tangerang',
  'Bekasi',
];

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  DiscussionCategory.Transportasi,
  DiscussionCategory.GangguanDarurat,
  DiscussionCategory.AcaraKota,
  DiscussionCategory.TipsLokal,
  DiscussionCategory.LowonganKerja,
];

export const APP_NAME = "JaboWay";