const { execSync } = require("child_process")

const versionRx = /^([0-9]+)\.([0-9]+)\.(.*)$/

const versionString = execSync("node -v").toString().trim().replace("v", "")
const version = versionRx.exec(versionString).slice(1)
const minVersion = versionRx.exec(process.argv[2]).slice(1)

const command = process.argv.slice(3).join(" ")

if (versionCompare(version, minVersion) >= 0) {
    console.log(
        `node v${versionString} >= ${minVersion.join(
            ".",
        )}; executing '${command}'`,
    )

    try {
        execSync(command, { stdio: "inherit" })
    } catch (e) {
        process.exit(e.status)
    }
}

function versionCompare([aMajor, aMinor, aPatch], [bMajor, bMinor, bPatch]) {
    const major = Number(aMajor) - Number(bMajor)

    if (major === 0) {
        const minor = Number(aMinor) - Number(bMinor)

        if (minor === 0) {
            const patch = Number(aPatch) - Number(bPatch)

            return patch
        }

        return minor
    }

    return major
}
