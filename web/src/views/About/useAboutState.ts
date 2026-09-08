// SPDX-FileCopyrightText: 2026 Dong Lab, Yale School of Medicine <https://donglab.org>
//
// SPDX-License-Identifier: Apache-2.0

import { useAllSources } from "@/api/hooks/useSources"
import { useCapabilities } from "@/api/hooks/useCapabilities"
import { useTrackManifest } from "@/api/hooks/useBrowser"
import { DATA_DOMAINS } from "@/config/methodology"

export function useAboutState() {
  const capabilities = useCapabilities().data
  const sources = useAllSources().data ?? []
  const studies = useTrackManifest().data?.studies ?? []
  const domains = DATA_DOMAINS.filter((d) => !d.capability || capabilities?.[d.capability])
  return { domains, sources, studies }
}
