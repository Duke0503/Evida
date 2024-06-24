const outlet = require('../models/outlet.model');
const outlets = require('../models/outlet.model');
const { save_data_to_database } = require('./save_data_to_database');

const check_time_outlet = async (
  list_ebox_outlet
) => {
  const more_than_30_min = new Date(new Date().getTime() - 30 * 60 * 1000);
  const more_than_60_min = new Date(new Date().getTime() - 60 * 60 * 1000);

  const outlet_with_status_2 = await outlets.find({
    status: 2,
    update_time: { $lte: more_than_30_min },
  });

  const outlet_with_status_differ_2 = await outlets.find({
    status: { $ne: 2 },
    update_time: { $lte: more_than_60_min },
  });

  const outlet = [...outlet_with_status_2, ...outlet_with_status_differ_2];

  for (const outlet_ of outlet) {
    if (list_ebox_outlet[outlet_.name]) {
      save_data_to_database(list_ebox_outlet[outlet_.name]);
    };

    await outlets.updateOne(      
      {_id: outlet_._id },
      { $set: { update_time: new Date() } }
    );
  };
};

module.exports = { check_time_outlet };