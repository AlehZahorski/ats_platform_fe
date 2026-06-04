// Partner/investor access token — mirror of PartnerTokenRead on the backend.
// The `token` is the shareable code the admin sends to an investor.

export interface PartnerToken {
  id:             string;
  label:          string;
  token:          string;
  note:           string | null;
  is_active:      boolean;
  expires_at:     string | null;
  max_views:      number | null;
  view_count:     number;
  last_viewed_at: string | null;
  created_at:     string;
  updated_at:     string;
}

export interface PartnerTokenList {
  items: PartnerToken[];
  total: number;
}
