const check_status_outlet_charging = (
  list_box_outlet,
  outlet_id
) => {
  if (list_box_outlet[outlet_id].outlet_status == 2) return true;
  return false;
};

module.exports = {
  check_status_outlet_charging,
}