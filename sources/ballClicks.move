module MyAddr::ballClicks{

use aptos_std::smart_vector::{Self, SmartVector};
use aptos_framework::event;
use std::signer;
use aptos_framework::account;

struct Counter has key {
    count: u64,
    set_task_event: event::EventHandle<UserCount>,
    allcounts: SmartVector<UserCount>
}

struct UserCount has store, copy, drop {
    address: address,
    count: u64,
}

public entry fun initalize(account: &signer) {
    let counts = Counter {
        count: 0,
        set_task_event: account::new_event_handle<UserCount>(account),
        allcounts: smart_vector::new()
    };
    move_to(account, counts);
}

public entry fun incrementer(account: &signer) acquires Counter {
    let signer_address = signer::address_of(account);
    let addCount = borrow_global_mut<Counter>(signer_address);
    addCount.count = addCount.count + 1;

    let user_count = UserCount {
        address: signer_address,
        count: addCount.count,
    };

    smart_vector::push_back(&mut addCount.allcounts,user_count);
    event::emit_event<UserCount>(
        &mut addCount.set_task_event,
        user_count
    );
}

}