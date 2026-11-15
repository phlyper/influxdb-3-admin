fn main() {
    // OpenSSH starts this binary as an askpass helper when an SSH
    // tunnel uses password authentication. Print the password and
    // exit before Tauri initializes.
    if influxadmin_lib::try_run_as_askpass() {
        return;
    }

    influxadmin_lib::run();
}
