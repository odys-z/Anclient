#pragma once

#include <filesystem>
#include <string>

#include "gen/app_settings.hpp"

namespace anson {

std::string get_home_dir();
std::string expand_tilde(const std::string& p);
std::string normalize_path(const std::filesystem::path& raw, bool require_exists);
DesknownPaths collect_known_paths(bool require_exists);

} // namespace anson
