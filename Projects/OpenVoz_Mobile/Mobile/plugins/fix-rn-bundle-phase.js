const { createRunOncePlugin, withXcodeProject } = require('@expo/config-plugins');

const PLUGIN_NAME = 'openvoz-fix-rn-bundle-phase';
const PLUGIN_VERSION = '1.0.0';
const PHASE_NAME = 'Bundle React Native code and images';

const FIXED_SHELL_SCRIPT = `if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# The project root by default is one level up from the ios directory
export PROJECT_ROOT="$PROJECT_DIR"/..

if [[ "$CONFIGURATION" = *Debug* ]]; then
  export SKIP_BUNDLING=1
fi
if [[ -z "$ENTRY_FILE" ]]; then
  # Set the entry JS file using the bundler's entry resolution.
  export ENTRY_FILE="$("$NODE_BINARY" -e "require('expo/scripts/resolveAppEntry')" "$PROJECT_ROOT" ios absolute | tail -n 1)"
fi

if [[ -z "$CLI_PATH" ]]; then
  # Use Expo CLI
  export CLI_PATH="$("$NODE_BINARY" --print "require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })")"
fi
if [[ -z "$BUNDLE_COMMAND" ]]; then
  # Default Expo CLI command for bundling
  export BUNDLE_COMMAND="export:embed"
fi

# Source .xcode.env.updates if it exists to allow
# SKIP_BUNDLING to be unset if needed
if [[ -f "$PODS_ROOT/../.xcode.env.updates" ]]; then
  source "$PODS_ROOT/../.xcode.env.updates"
fi
# Source local changes to allow overrides
# if needed
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

RN_XCODE_SCRIPT="$("$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'")"
bash "$RN_XCODE_SCRIPT"
`;

function withFixedReactNativeBundlePhase(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const targetName = config.modRequest.projectName;
    const targetId = project.findTargetKey(targetName ?? '');

    if (!targetId) {
      console.warn(
        `[OpenVoz] Could not find Xcode target "${targetName}" while patching the React Native bundle phase.`
      );
      return config;
    }

    const target = project.pbxNativeTargetSection()[targetId];
    const buildPhases = target?.buildPhases ?? [];
    const bundlePhaseRef = buildPhases.find((phase) => phase.comment === PHASE_NAME);

    if (!bundlePhaseRef) {
      console.warn(
        `[OpenVoz] Could not find "${PHASE_NAME}" while patching the React Native bundle phase.`
      );
      return config;
    }

    const bundlePhase =
      project.hash.project.objects.PBXShellScriptBuildPhase?.[bundlePhaseRef.value];

    if (!bundlePhase) {
      console.warn(
        `[OpenVoz] Could not load the shell script build phase for "${PHASE_NAME}".`
      );
      return config;
    }

    if (bundlePhase.shellScript === FIXED_SHELL_SCRIPT) {
      return config;
    }

    bundlePhase.shellPath = '/bin/sh';
    bundlePhase.shellScript = JSON.stringify(FIXED_SHELL_SCRIPT);
    return config;
  });
}

module.exports = createRunOncePlugin(
  withFixedReactNativeBundlePhase,
  PLUGIN_NAME,
  PLUGIN_VERSION
);
